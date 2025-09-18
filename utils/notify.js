import Notification from "../models/notificationModel.js"; // adjust pa
/**
 * Save a new notification for a user
 * @param {Object} params
 * @param {String} params.userId - The user who receives the notification
 * @param {String} params.title - Notification title
 * @param {String} params.description - Notification description/body
 * @param {String} params.action - What the notification is about (e.g. "order", "profile", etc.)
 * @param {String} [params.type] - Optional: type/category
 * @param {String} [params.content] - Optional: extra info
 * @param {String} [params.image] - Optional: image/icon
 */


export const pushNotification = async ({
  userId,
  title,
  description,
  action,
  type,
  content,
  image,
}) => {
  try {
    if (!userId || !title || !description || !action) {
      throw new Error("Missing required notification fields");
    }

    const notif = await Notification.create({
      user: userId,
      title,
      description,
      action,
      type,
      content,
      image,
    });

    return notif;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
    return null;
  }
};
