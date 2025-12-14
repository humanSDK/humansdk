const User = require("../models/User")
const Notification = require("../models/Notification")

exports.send = async (socket, data) => {
    try {
        const { sendTo, title, message, link } = data;

        if (!sendTo) {
            console.log("No send to email provided")
            return;
        }
        const destinationUser = await User.findOne({ email: sendTo })
        if (!destinationUser) {
            console.log("Dstination address not exixst");
            return;
        }

        const notification = new Notification({ source: socket.user.id, destination: destinationUser._id, title, message, link })
        await notification.save()


        // Populate source and destination details for the response
        const populatedNotification = await Notification.findById(notification._id)
            .populate("source", "name avatar") // Populate source user details
            .populate("destination", "name avatar"); // Populate destination user details


        // Emit the notification to the destination user
        socket.to(destinationUser._id.toString()).emit("receive_new_notification", {
            notification: populatedNotification,
        });
    } catch (error) {
        console.log("Failed to send message-->", error.message)
    }
}