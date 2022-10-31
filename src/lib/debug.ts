import debug from "debug";

const d = debug("dci-lint");

export default function debug2(namespace: string) {
  return d.extend(namespace);
}
