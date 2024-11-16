// /* eslint-disable import/prefer-default-export */
// // services/scheduler.ts
// import cron from 'node-cron';
// import { logger } from '../logger'; // Ensure you have a logger set up
// import InstagramAccount from '../instagram/instagram.model';
// import { refreshAccessToken } from '../instagram/instagram.service';

// /**
//  * Starts a scheduler to refresh Instagram access tokens before they expire.
//  * Runs daily at midnight.
//  */
// export const startTokenRefreshScheduler = () => {
//   // Schedule the job to run once a day at midnight
//   cron.schedule('0 0 * * *', async () => {
//     try {
//       logger.info('Starting Instagram access token refresh job.');

//       // Define the threshold: tokens expiring within the next 7 days
//       const now = new Date();
//       const thresholdDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

//       // Find accounts with tokens expiring within the threshold
//       const accountsToRefresh = await InstagramAccount.find({
//         expiresAt: { $lte: thresholdDate },
//       });

//       logger.info(`Found ${accountsToRefresh.length} Instagram accounts to refresh.`);

//       for (const account of accountsToRefresh) {
//         await refreshAccessToken(account);
//       }

//       logger.info('Instagram access token refresh job completed.');
//     } catch (error: any) {
//       logger.error('Error during Instagram access token refresh job:', error.message);
//     }
//   });

//   logger.info('Instagram access token refresh scheduler started.');
// };
