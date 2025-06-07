// File: networkStatus.js
// Description: Utility function to check online or offline status

/**
 * Function to check if the application is online.
 * @returns {Promise<boolean>} - Resolves to true if online, false otherwise.
 */
export const isOnline = async () => {
  try {
      // Check if the navigator object is available and its online property
      return navigator.onLine;
  } catch (error) {
      return false;
  }
};

/**
* Function to check if the application is offline.
* @returns {Promise<boolean>} - Resolves to true if offline, false otherwise.
*/
export const isOffline = async () => {
  const online = await isOnline();
  return !online;
};
