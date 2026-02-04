import { successSound, errorSound } from '../../audio/audio.js';

export interface CameraSetupResult {
  showCameraToggle: boolean;
  cameras: MediaDeviceInfo[];
  useFacingMode: boolean;
}

/**
 * Enumerates available video devices and determines the best camera switching strategy.
 */
export const setupCameras = async (): Promise<CameraSetupResult> => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoCameras = devices.filter(dev => dev.kind === 'videoinput');
  console.debug('Available cameras:', videoCameras);

  if (videoCameras.length <= 1) {
    return {
      showCameraToggle: false,
      cameras: videoCameras,
      useFacingMode: true
    };
  }

  // Not all cameras list their facing modes.
  const hasDifferentFacingModes = videoCameras.some(cam =>
    (cam as any).facingMode === 'environment'
  ) && videoCameras.some(cam =>
    (cam as any).facingMode === 'user' || !(cam as any).facingMode
  );

  // Sometimes cameras have a label such as "facing front" or "facing back".
  const hasLabelBasedFacing = videoCameras.some(cam =>
    cam.label.toLowerCase().includes('facing')
  );

  if (hasDifferentFacingModes || hasLabelBasedFacing) {
    console.debug('Using facingMode toggle (mobile/tablet)');
    return {
      showCameraToggle: true,
      cameras: videoCameras.slice(0, 2),
      useFacingMode: true
    };
  } else {
    console.debug('Using deviceId toggle (PC with multiple webcams)');
    return {
      showCameraToggle: true,
      cameras: videoCameras.slice(0, 2),
      useFacingMode: false
    };
  }
};

/**
 * Determines if the camera view should be flipped horizontally.
 */
export const shouldFlipCameraView = (
  useFacingMode: boolean,
  currentCameraIndex: number,
  cameras: MediaDeviceInfo[]
): boolean => {

  // If facing mode is not in question, the camera is probably a web cam in which case it should be treated as a selfie cam.
  if (!useFacingMode) return true;

  // Selfie cameras are usually the first ones.
  if (currentCameraIndex === 0) return true;

  const currentCam = cameras[currentCameraIndex];
  if (!currentCam) return false;

  // Note that sometimes the mobile devices report the cameras wrong. So a back facing camera might actually read front in the label.
  const label = currentCam.label.toLowerCase();
  if (label.includes('front')) return true;

  return false;
};

/**
 * Plays success or error sound.
 */
export const tryToPlayAudio = (success: boolean): Promise<void> => {
  if (success) {
    successSound.currentTime = 0;
    successSound.volume = 1;
    return successSound.play();
  } else {
    errorSound.currentTime = 0;
    errorSound.volume = 0.1;
    return errorSound.play();
  }
};

/**
 * Switches to the next camera in the list.
 */
export const switchCamera = (
  useFacingMode: boolean,
  currentCameraIndex: number,
  cameras: MediaDeviceInfo[]
): number => {

  if (useFacingMode) {
    const newIndex = currentCameraIndex === 0 ? 1 : 0;
    console.debug('Switching facingMode, new index:', newIndex);
    return newIndex;
  } else {
    const newIndex = (currentCameraIndex + 1) % cameras.length;
    console.debug('Switching camera by deviceId, new index:', newIndex, 'deviceId:', cameras[newIndex]?.deviceId);
    return newIndex;
  }
};

/**
 * Generates camera constraints for the QR scanner.
 */
export const getCameraConstraints = (
  useFacingMode: boolean,
  currentCameraIndex: number,
  cameras: MediaDeviceInfo[]
): any => {

  return {
    aspectRatio: 1,
    ...(useFacingMode
      ? { facingMode: currentCameraIndex === 0 ? 'user' : 'environment' } // Usually the selfie camera is the first one.
      : cameras[currentCameraIndex]?.deviceId
        ? { deviceId: { exact: cameras[currentCameraIndex].deviceId } }
        : {}
    )
  };
};
