const mongoose = require("mongoose");

const contractInfoSchema = mongoose.Schema({
  tokenIssue: {
    type: String,
  },
  contractAddress: {
    type: String,
  },
  contractDecimals: {
    type: Number,
  },
});

const totalSupplySchema = mongoose.Schema({
  totalSupply: {
    type: Number,
  },
  MaxSupply: {
    type: Number,
  },
});

const communityInfoSchema = mongoose.Schema({
  twitter: {
    type: String,
  },
  facebook: {
    type: String,
  },
  telegram: {
    type: String,
  },
  youtube: {
    type: String,
  },
  subreddit: {
    type: String,
  },
  discord: {
    type: String,
  },
  medium: {
    type: String,
  },
  instagram: {
    type: String,
  },
  otherMedia: [String],
});

const developerInfoSchema = mongoose.Schema({
  github: {
    type: String,
  },
  gitlab: {
    type: String,
  },
  gitbucket: {
    type: String,
  },
});

const newTokenSchema = mongoose.Schema(
  {
    id: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    nameToken: {
      type: String,
      required: true,
    },
    symbolToken: {
      type: String,
      required: true,
    },
    rwaCategory: [String],
    descriptionToken: {
      type: String,
    },
    website: {
      type: String,
      required: true,
    },
    whitepaper: {
      type: String,
    },
    submitter: {
      type: String,
    },
    exchangeTradeUrl: [String],
    explorerLink: [String],
    contractInformation: [contractInfoSchema],
    totalSupplyDetail: totalSupplySchema,
    communityInformation: communityInfoSchema,
    developerInformation: developerInfoSchema,
    tokenImage: {
      type: String,
      required: true,
    },
    additionalInfomation: {
      type: String,
    },
    listingTerm: {
      type: Boolean,
      default: false,
    },
    supportTerm: {
      type: Boolean,
      default: false,
    },
    accuracyDeclaration: {
      type: Boolean,
      default: false,
    },
    publicDeclarationPost: {
      type: Boolean,
      default: false,
    },
    adminVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = new mongoose.model("Token", newTokenSchema);
