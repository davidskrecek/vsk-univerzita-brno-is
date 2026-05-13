import { Worker, Job } from "bullmq";
// import { redisConnection } from "../redis";
import { sendInvitationEmail } from "../mailer";

const QUEUE_NAME = "email-queue";

// // Singleton for the queue
// let emailQueue: Queue;

// if (process.env.NODE_ENV === "production") {
//   emailQueue = new Queue(QUEUE_NAME, { connection: redisConnection });
// } else {
//   // Prevent multiple instances in development during hot reloads
//   if (!(global as any).emailQueue) {
//     (global as any).emailQueue = new Queue(QUEUE_NAME, { connection: redisConnection });
//   }
//   emailQueue = (global as any).emailQueue;
// }

const emailQueue = {
  add: async (_name: string, data: EmailJobData) => {
    if(data.type === "invitation") {
      await sendInvitationEmail(data.email, data.link);
    }
    return Promise.resolve();
  }
}

export { emailQueue };

export interface EmailJobData {
  type: "invitation";
  email: string;
  link: string;
}

// const globalRef = globalThis as unknown as { emailWorker?: Worker };
// 
// if (process.env.NODE_ENV === "production" || !globalRef.emailWorker) {
//   const worker = new Worker(
//     QUEUE_NAME,
//     async (job: Job<EmailJobData>) => {
//       console.log(`[QUEUE] Processing job ${job.id} of type ${job.data.type}`);
//       
//       try {
//         if (job.data.type === "invitation") {
//           await sendInvitationEmail(job.data.email, job.data.link);
//         }
//         console.log(`[QUEUE] Job ${job.id} completed successfully`);
//       } catch (error) {
//         console.error(`[QUEUE] Job ${job.id} failed:`, error);
//         throw error;
//       }
//     },
//     { 
//       connection: redisConnection,
//       removeOnComplete: { count: 100 },
//       removeOnFail: { count: 1000 },
//     }
//   );
// 
//   if (process.env.NODE_ENV !== "production") {
//     globalRef.emailWorker = worker;
//   }
// 
//   worker.on("failed", (job, err) => {
//     console.error(`[QUEUE] Job ${job?.id} failed with error: ${err.message}`);
//   });
// }

