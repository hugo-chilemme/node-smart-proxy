import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { arch, hostname, platform } from 'node:os';

const readFileIfExists = (filePath: string): string | null => {
	if (!existsSync(filePath)) {
		return null;
	}

	return readFileSync(filePath, 'utf8').trim();
};

const fallbackMachineInfo = (): string => hostname() + platform() + arch();

const getMachineId = (): string => {
	let id = '';

	try {
		if (process.platform === 'win32') {
			id = execSync('wmic csproduct get uuid').toString().split('\n')[1]?.trim() ?? '';
		} else if (process.platform === 'linux') {
			id = readFileIfExists('/etc/machine-id')
				?? readFileIfExists('/var/lib/dbus/machine-id')
				?? '';
		} else if (process.platform === 'darwin') {
			id = execSync('ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID')
				.toString()
				.split('"')[3] ?? '';
		}
	} catch {
		id = fallbackMachineInfo();
	}

	if (!id) {
		id = fallbackMachineInfo();
	}

	return createHash('sha256').update(id).digest('hex');
};

export default getMachineId;
