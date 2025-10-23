import { createHash } from "crypto";
import { hostname, platform, arch } from "os";
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

function getMachineId() {
  let id = "";

  try {
    if (process.platform === "win32") {
      id = execSync("wmic csproduct get uuid").toString().split("\n")[1].trim();
    } else if (process.platform === "linux") {
      if (existsSync("/etc/machine-id"))
        id = readFileSync("/etc/machine-id", "utf8").trim();
      else if (existsSync("/var/lib/dbus/machine-id"))
        id = readFileSync("/var/lib/dbus/machine-id", "utf8").trim();
    } else if (process.platform === "darwin") {
      id = execSync("ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID")
        .toString()
        .split('"')[3];
    }
  } catch {
    id = hostname() + platform() + arch();
  }

  // Hash pour anonymiser et rendre cohérent entre OS
  return createHash("sha256").update(id).digest("hex");	
}

export default getMachineId;
