import userModel from "../models/userModels.js";

const updateAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { index, newAddress } = req.body;

        if (index < 0 || index > 2) {
            return res.status(400).json({ success: false, message: "Index must be 0, 1, or 2" });
        }

        if (
            !newAddress ||
            typeof newAddress.address !== "string" ||
            typeof newAddress.active !== "boolean"
        ) {
            return res.status(400).json({ success: false, message: "Invalid address format" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Initialize with empty array if undefined
        let addressArray = user.address || [{ address: "null", active: false }, { address: "null", active: false }, { address: "null", active: false }];

        // Make a copy and update only the provided index
        const updatedAddresses = [...addressArray];
        updatedAddresses[index] = newAddress;

        [0, 1, 2].forEach(i => {
            if (i !== index && updatedAddresses[i]) {
                updatedAddresses[i].active = false;
            }
        });
        user.address = updatedAddresses;
        await user.save();

        return res.status(200).json({ success: true, address: user.address });
    } catch (error) {
        console.error("Update Address Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export { updateAddress };