import argparse
import random
import threading
import time

from ditto_client import DittoClient
from dataclasses import dataclass
import re
from typing import List, Optional


@dataclass
class Bus:
    id: int
    line: str
    location: Optional[List[float]] = None


def generate_busses(count: int) -> List[Bus]:
    """Generate synthetic bus templates.

    IDs will be 1..count and lines will be Line 1..count. Locations are generated in a small bounding box.
    """
    buses: List[Bus] = []
    base_lat, base_lon = 44.0600, 12.5667
    for i in range(1, count + 1):
        line = f"Line {((i - 1) % 10) + 1}"
        lat = base_lat + random.uniform(-0.03, 0.03)
        lon = base_lon + random.uniform(-0.03, 0.03)
        buses.append(Bus(id=i, line=line, location=[lat, lon]))
    return buses
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class Station:
    code: str
    name: str
    location: Optional[List[float]] = None


def generate_stations(count: int) -> List[Station]:
    """Generate synthetic station templates.

    Codes will be S0001.. and names Station 1..count. Locations are generated in a small bounding box.
    """
    stations: List[Station] = []
    # bounding box somewhere arbitrary (e.g., Rimini area) — use small jitter base
    base_lat, base_lon = 44.0600, 12.5667
    for i in range(1, count + 1):
        code = f"S{i:04d}"
        name = f"Station {i}"
        lat = base_lat + random.uniform(-0.02, 0.02)
        lon = base_lon + random.uniform(-0.02, 0.02)
        stations.append(Station(code=code, name=name, location=[lat, lon]))
    return stations


def randomize_station(s):
    """Return a shallow-copy of station data with randomized actual/forecast values and jittered location."""
    # assume station has attributes used in original script
    thing_id = f"{s.code}"
    # produce a sanitized location string in the form "lat,lon" (no brackets or spaces)
    def _format_location(loc):
        if isinstance(loc, (list, tuple)) and len(loc) >= 2:
            lat, lon = float(loc[0]), float(loc[1])
            lat += random.uniform(-0.0005, 0.0005)
            lon += random.uniform(-0.0005, 0.0005)
            return f"{lat},{lon}"
        if isinstance(loc, str):
            # try to extract two floats from the string and join them with a comma
            nums = re.findall(r"-?\d+\.\d+", loc)
            if len(nums) >= 2:
                return f"{nums[0]},{nums[1]}"
            # fallback: remove spaces and brackets
            return loc.replace(" ", "").replace("[", "").replace("]", "").replace("(", "").replace(")", "")
        return None

    loc = getattr(s, "location", None)
    location = _format_location(loc)

    body = {
        "thingId": thing_id,
        "attributes": {
            "code": s.code,
            "model": s.name,
            "location": location,
        },
        "features": {
            "actual": {
                "properties": {
                    "Direction Rimini": random.randint(0, 10),
                    "Direction Riccione": random.randint(0, 10),
                }
            },
            "arrivals": {
                "properties": {
                    "Direction Rimini": random.randint(0, 20),
                    "Direction Riccione": random.randint(0, 20),
                }
            },
        },
    }
    return thing_id, body


def randomize_bus(b):
    thing_id = f"bus-{b.id}"
    # produce a sanitized location string in the form "lat,lon" (no brackets or spaces)
    def _format_location(loc):
        if isinstance(loc, (list, tuple)) and len(loc) >= 2:
            lat, lon = float(loc[0]), float(loc[1])
            lat += random.uniform(-0.001, 0.001)
            lon += random.uniform(-0.001, 0.001)
            return f"{lat},{lon}"
        if isinstance(loc, str):
            nums = re.findall(r"-?\d+\.\d+", loc)
            if len(nums) >= 2:
                return f"{nums[0]},{nums[1]}"
            return loc.replace(" ", "").replace("[", "").replace("]", "").replace("(", "").replace(")", "")
        return None

    loc = getattr(b, "location", None)
    location = _format_location(loc)

    body = {
        "thingId": thing_id,
        "attributes": {
            "id": b.id,
            "model": b.line if hasattr(b, "line") else getattr(b, "model", "bus"),
            "location": location,
        },
        "features": {
            "status": {
                "properties": {
                    "count": random.randint(0, 100),
                }
            }
        },
    }
    return thing_id, body


class Repeater(threading.Thread):
    def __init__(self, name: str, interval: float, worker, stop_event: threading.Event):
        super().__init__(daemon=True)
        self.interval = interval
        self.worker = worker
        self.stop_event = stop_event
        self.name = name

    def run(self):
        while not self.stop_event.is_set():
            start = time.time()
            try:
                self.worker()
            except Exception as e:
                print(f"Worker {self.name} raised: {e}")
            elapsed = time.time() - start
            to_wait = self.interval - elapsed
            if to_wait > 0:
                # wait but exit early if stop_event is set
                self.stop_event.wait(to_wait)


def make_sender(client: DittoClient, namespace: str, dry_run: bool):
    def send(thing_id: str, body: dict):
        full_id = f"{namespace}:{thing_id}"
        body["thingId"] = full_id
        if dry_run:
            print(f"DRY RUN -> PUT /api/2/things/{full_id}")
            print(body)
        else:
            resp = client.put_thing(full_id, body)
            status = resp.status_code
            try:
                j = resp.json()
            except Exception:
                j = resp.text
            print(f"PUT {full_id} -> {status}")
            print(j)

    return send


def main() -> None:
    parser = argparse.ArgumentParser(description="Load randomized data into Eclipse Ditto continuously")
    parser.add_argument("--namespace", default="org.example", help="Thing namespace to use (prefix).")
    parser.add_argument("--stations-count", type=int, default=100, help="Number of stations to send each interval")
    parser.add_argument("--stations-interval", type=float, default=30.0, help="Seconds between station batches")
    parser.add_argument("--busses-count", type=int, default=100, help="Number of busses to send each interval")
    parser.add_argument("--busses-interval", type=float, default=5.0, help="Seconds between bus batches")
    parser.add_argument("--duration", type=float, default=0.0, help="Total duration in seconds to run; 0 for infinite")
    parser.add_argument("--dry-run", action="store_true", help="Print actions instead of calling Ditto")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt and proceed")
    args = parser.parse_args()

    client = DittoClient()
    sender = make_sender(client, args.namespace, args.dry_run)

    # Pre-generate synthetic station templates and bus templates from provided start_data
    station_list = generate_stations(max(args.stations_count, 100))
    # generate synthetic buses (at least as many as requested)
    bus_list = generate_busses(max(args.busses_count, 100))

    if not args.yes and not args.dry_run:
        ok = input(f"Proceed to continuously PUT randomized Things to Ditto? (stations every {args.stations_interval}s, busses every {args.busses_interval}s) [y/N]: ")
        if ok.strip().lower() not in ("y", "yes"):
            print("Aborted by user.")
            return

    stop_event = threading.Event()

    def station_worker():
        # choose N stations randomly (with replacement if requested size > available)
        chosen = [random.choice(station_list) for _ in range(args.stations_count)]
        for s in chosen:
            thing_id, body = randomize_station(s)
            sender(thing_id, body)

    def bus_worker():
        chosen = [random.choice(bus_list) for _ in range(args.busses_count)]
        for b in chosen:
            thing_id, body = randomize_bus(b)
            sender(thing_id, body)

    station_thread = Repeater("stations", args.stations_interval, station_worker, stop_event)
    bus_thread = Repeater("busses", args.busses_interval, bus_worker, stop_event)

    station_thread.start()
    bus_thread.start()

    print("Started station and bus repeaters. Press Ctrl-C to stop.")
    try:
        if args.duration and args.duration > 0:
            time.sleep(args.duration)
        else:
            while True:
                time.sleep(1)
    except KeyboardInterrupt:
        print("Stopping...")
    finally:
        stop_event.set()
        station_thread.join(timeout=5)
        bus_thread.join(timeout=5)
        print("Stopped.")


if __name__ == "__main__":
    main()
