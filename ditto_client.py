from __future__ import annotations

import base64
import json
import os
from dataclasses import dataclass
from typing import Any, Dict, Mapping, Optional

import requests


DEFAULT_BASE_URL = "http://localhost:8080"
DEFAULT_TIMEOUT = 10.0


@dataclass
class DittoConfig:
    base_url: str
    auth_basic: Optional[str]
    username: Optional[str]
    password: Optional[str]
    timeout: float

    @classmethod
    def from_env(cls) -> "DittoConfig":
        # Attempt to load a .env file if python-dotenv is available. We do this here
        # so environment variables are read at runtime rather than at module import
        # time (avoids missing vars when callers load .env later).
        try:
            from dotenv import load_dotenv  # type: ignore

            load_dotenv()
        except Exception:
            pass

        base_url = os.getenv("DITTO_BASE", DEFAULT_BASE_URL)
        auth_basic = os.getenv("DITTO_AUTH_BASIC")
        username = os.getenv("DITTO_USERNAME")
        password = os.getenv("DITTO_PASSWORD")
        timeout = float(os.getenv("DITTO_TIMEOUT", str(DEFAULT_TIMEOUT)))
        return cls(base_url=base_url, auth_basic=auth_basic, username=username, password=password, timeout=timeout)


class DittoClient:
    """
    Minimal client for Eclipse Ditto REST API v2.

    - Auth: Basic auth via precomputed token (DITTO_AUTH_BASIC) or username/password.
    - Base URL: DITTO_BASE (default http://localhost:8080)
    """

    def __init__(self, config: Optional[DittoConfig] = None) -> None:
        self.config = config or DittoConfig.from_env()
        self.session = requests.Session()

    # --- internal helpers ---
    def _auth_header(self) -> str:
        if self.config.auth_basic:
            return f"Basic {self.config.auth_basic}"
        if self.config.username is not None and self.config.password is not None:
            token = base64.b64encode(
                f"{self.config.username}:{self.config.password}".encode("utf-8")
            ).decode("ascii")
            return f"Basic {token}"
        raise ValueError(
            "Missing authentication. Provide DITTO_AUTH_BASIC or DITTO_USERNAME/DITTO_PASSWORD"
        )

    def _headers(self, extra: Optional[Mapping[str, str]] = None) -> Dict[str, str]:
        base = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": self._auth_header(),
        }
        if extra:
            base.update(extra)
        return base

    def _url(self, path: str) -> str:
        return f"{self.config.base_url.rstrip('/')}{path}"

    # --- public API ---
    def put_thing(self, thing_id: str, body: Mapping[str, Any]) -> requests.Response:
        """
        Create or replace a Thing.
        thing_id must include namespace, e.g. "org.example:device-123".
        """
        url = self._url(f"/api/2/things/{thing_id}")
        resp = self.session.put(
            url, headers=self._headers(), data=json.dumps(dict(body)), timeout=self.config.timeout
        )
        return resp

    def get_thing(self, thing_id: str) -> requests.Response:
        url = self._url(f"/api/2/things/{thing_id}")
        return self.session.get(url, headers=self._headers(), timeout=self.config.timeout)

    def patch_thing(self, thing_id: str, patch_ops: Any) -> requests.Response:
        """
        Apply JSON Patch to a Thing. patch_ops should be a JSON Patch list.
        """
        url = self._url(f"/api/2/things/{thing_id}")
        headers = self._headers({"Content-Type": "application/json-patch+json"})
        return self.session.patch(url, headers=headers, data=json.dumps(patch_ops), timeout=self.config.timeout)

    def update_features(self, thing_id: str, features: Mapping[str, Any]) -> requests.Response:
        url = self._url(f"/api/2/things/{thing_id}/features")
        return self.session.put(
            url,
            headers=self._headers(),
            data=json.dumps(dict(features)),
            timeout=self.config.timeout,
        )

    def delete_thing(self, thing_id: str) -> requests.Response:
        url = self._url(f"/api/2/things/{thing_id}")
        return self.session.delete(url, headers=self._headers(), timeout=self.config.timeout)
