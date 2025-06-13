const Airdrop = require("../models/airdropModel");
const cloudinary = require("../../config/cloudinary");

const getAllAirdrops = async (req, res) => {
  try {
    const airdrops = await Airdrop.find();
    res.status(200).json({
      message: "Airdrops fetched successfully",
      data: airdrops,
      status: "true",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch airdrops", status: "false" });
  }
};

const createAirdrop = async (req, res) => {
  try {
    const {
      tokenName,
      tokenTicker,
      chain,
      tokenDescription,
      airdropEligibility,
      airdropStart,
      airdropEnd,
      airdropAmt,
    } = req.body;

    const role = req.role;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super admin can add airdrop",
      });

    const uploadImg = await cloudinary.uploader.upload(req.file.path, {
      use_filename: true,
      folder: "rwa/airdrop",
    });

    if (!uploadImg)
      return res
        .status(500)
        .json({ status: false, message: "Error in uploading image" });

    // if (!name || !project || !description || !eligibility || !startDate || !endDate || !reward) {
    //     return res.status(400).json({
    //       message: "All fields are required.",
    //       status: false,
    //     });
    //   }

    const newAirdrop = new Airdrop({
      tokenName,
      image: uploadImg.secure_url,
      tokenTicker,
      chain,
      tokenDescription,
      airdropEligibility,
      airdropStart,
      airdropEnd,
      airdropAmt,
    });
    await newAirdrop.save();

    res.status(201).json({
      message: "Airdrop created successfully",
      status: "true",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create airdrop", status: "false" });
  }
};

const updateAirdrop = async (req, res) => {
  try {
    const {
      tokenName,
      tokenTicker,
      chain,
      tokenDescription,
      airdropEligibility,
      airdropStart,
      airdropEnd,
      airdropAmt,
    } = req.body;
    const role = req.role;
    const { id } = req.params;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super admin can add airdrop",
      });

    let uploadImg;
    if (req.file) {
      uploadImg = await cloudinary.uploader.upload(req.file.path, {
        use_filename: true,
        folder: "rwa/airdrop",
      });
    }

    const airdrop = await Airdrop.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          tokenName,
          image: uploadImg?.secure_url,
          tokenTicker,
          chain,
          tokenDescription,
          airdropEligibility,
          airdropStart,
          airdropEnd,
          airdropAmt,
        },
      }
    );
    if (!airdrop) {
      return res
        .status(404)
        .json({ message: "Airdrop not found", status: "false" });
    }

    res.status(200).json({
      message: "Airdrop updated successfully",
      status: "true",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update airdrop", status: "false" });
  }
};

const deleteAirdrop = async (req, res) => {
  try {
    const role = req.role;
    const { id } = req.params;

    if (role !== "SUPERADMIN")
      return res.status(401).json({
        status: false,
        message: "Only Super admin can add airdrop",
      });

    const airdrop = await Airdrop.findOneAndDelete({ _id: id });
    if (!airdrop) {
      return res
        .status(404)
        .json({ message: "Airdrop not found", status: "false" });
    }

    res.status(200).json({
      message: "Airdrop deleted successfully",
      status: "true",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete airdrop", status: "false" });
  }
};

module.exports = {
  getAllAirdrops,
  createAirdrop,
  updateAirdrop,
  deleteAirdrop,
};
