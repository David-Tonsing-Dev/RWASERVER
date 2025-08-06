const differenceTwoDates = require("./moments/dateDifference");

const calculateForBadge = (user, userStat) => {
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 360 &&
    userStat.totalThreadPosted >= 50 &&
    userStat.totalCommentGiven >= 300 &&
    userStat.totalLikeReceived >= 250 &&
    userStat.totalFollower >= 50 &&
    userStat.totalViewReceived >= 10000
  ) {
    userStat.tieredProgression = {
      title: "Veteran",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311458/RWAPros/Badges/veteran_ko4xaz.svg",
    };
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 30 &&
    userStat.totalThreadPosted >= 10 &&
    userStat.totalCommentGiven >= 50 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 10 &&
    userStat.totalViewReceived >= 1000
  ) {
    userStat.tieredProgression = {
      title: "Contributor",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311436/RWAPros/Badges/contributor_fjgqcy.svg",
    };
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 1 &&
    userStat.totalThreadPosted >= 1 &&
    userStat.totalCommentGiven >= 1
  ) {
    userStat.tieredProgression = {
      title: "Explorer",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
    };
  } else {
    userStat.tieredProgression = {
      title: "Observer",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311435/RWAPros/Badges/observer_gs5nck.svg",
    };
  }

  // for Skill & Reputation-Based Badges
  if (
    userStat.totalThreadPosted >= 75 &&
    userStat.totalCommentGiven >= 500 &&
    userStat.totalLikeReceived >= 500 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 25000
  ) {
    userStat.reputation = {
      title: "Pro",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311456/RWAPros/Badges/pros_a1ylf6.svg",
    };
  } else if (
    userStat.totalThreadPosted >= 100 &&
    userStat.totalCommentGiven >= 750 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 200 &&
    userStat.totalViewReceived >= 50000
  ) {
    userStat.reputation = {
      title: "Expert",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
    };
  } else if (
    userStat.totalThreadPosted >= 150 &&
    userStat.totalCommentGiven >= 1000 &&
    userStat.totalLikeReceived >= 2500 &&
    userStat.totalFollower >= 400 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.reputation = {
      title: "Top contributor",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/top_contributor_voskr4.svg",
    };
  }

  // For social influencer
  if (
    differenceTwoDates(user.createdAt, new Date()) <= 30 &&
    userStat.totalThreadPosted >= 5 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 25 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.star = {
      title: "Rising start",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/rising_star_yp1qfg.svg",
    };
  }

  // For influencer
  if (
    userStat.totalLikeReceived >= 2000 &&
    userStat.totalFollower >= 500 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.influence = {
      title: "Influencer",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/influencer_imfh3g.svg",
    };
  }

  // For quality badge
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 90 &&
    userStat.totalThreadPosted >= 20 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.quality = {
      title: "Trusted member",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311434/RWAPros/Badges/trusted_member_jpcsha.svg",
    };
  }

  // For VIP badge
  if (userStat.totalFollower >= 1000 && userStat.totalViewReceived >= 250000) {
    userStat.vip = {
      title: "VIP",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311642/RWAPros/Badges/vip_zmhorp.svg",
    };
  }

  return userStat;
};

const calculateForBadgeWithoutImage = (user, userStat) => {
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 360 &&
    userStat.totalThreadPosted >= 50 &&
    userStat.totalCommentGiven >= 300 &&
    userStat.totalLikeReceived >= 250 &&
    userStat.totalFollower >= 50 &&
    userStat.totalViewReceived >= 10000
  ) {
    userStat.tieredProgression = "Veteran";
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 30 &&
    userStat.totalThreadPosted >= 10 &&
    userStat.totalCommentGiven >= 50 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 10 &&
    userStat.totalViewReceived >= 1000
  ) {
    userStat.tieredProgression = "Contributor";
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 1 &&
    userStat.totalThreadPosted >= 1 &&
    userStat.totalCommentGiven >= 1
  ) {
    userStat.tieredProgression = "Explorer";
  } else {
    userStat.tieredProgression = "Observer";
  }

  // for Skill & Reputation-Based Badges
  if (
    userStat.totalThreadPosted >= 75 &&
    userStat.totalCommentGiven >= 500 &&
    userStat.totalLikeReceived >= 500 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 25000
  ) {
    userStat.reputation = "Pro";
  } else if (
    userStat.totalThreadPosted >= 100 &&
    userStat.totalCommentGiven >= 750 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 200 &&
    userStat.totalViewReceived >= 50000
  ) {
    userStat.reputation = "Expert";
  } else if (
    userStat.totalThreadPosted >= 150 &&
    userStat.totalCommentGiven >= 1000 &&
    userStat.totalLikeReceived >= 2500 &&
    userStat.totalFollower >= 400 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.reputation = "Top contributor";
  }

  // For social influencer
  if (
    differenceTwoDates(user.createdAt, new Date()) <= 30 &&
    userStat.totalThreadPosted >= 5 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 25 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.star = "Rising start";
  }

  // For influencer
  if (
    userStat.totalLikeReceived >= 2000 &&
    userStat.totalFollower >= 500 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.influence = "Influencer";
  }

  // For quality badge
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 90 &&
    userStat.totalThreadPosted >= 20 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.quality = "Trusted member";
  }

  // For VIP badge
  if (userStat.totalFollower >= 1000 && userStat.totalViewReceived >= 250000) {
    userStat.vip = "VIP";
  }

  return userStat;
};

const calculateUserAllBadges = (user, userStat) => {
  // for Tiered Progression Badges
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 360 &&
    userStat.totalThreadPosted >= 50 &&
    userStat.totalCommentGiven >= 300 &&
    userStat.totalLikeReceived >= 250 &&
    userStat.totalFollower >= 50 &&
    userStat.totalViewReceived >= 10000
  ) {
    userStat.tieredProgression = [
      {
        title: "Veteran",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311458/RWAPros/Badges/veteran_ko4xaz.svg",
      },
      {
        title: "Contributor",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311436/RWAPros/Badges/contributor_fjgqcy.svg",
      },
      {
        title: "Explorer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
      },
      {
        title: "Observer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311435/RWAPros/Badges/observer_gs5nck.svg",
      },
    ];
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 30 &&
    userStat.totalThreadPosted >= 10 &&
    userStat.totalCommentGiven >= 50 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 10 &&
    userStat.totalViewReceived >= 1000
  ) {
    userStat.tieredProgression = [
      {
        title: "Contributor",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311436/RWAPros/Badges/contributor_fjgqcy.svg",
      },
      {
        title: "Explorer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
      },
      {
        title: "Observer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311435/RWAPros/Badges/observer_gs5nck.svg",
      },
    ];
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 1 &&
    userStat.totalThreadPosted >= 1 &&
    userStat.totalCommentGiven >= 1
  ) {
    userStat.tieredProgression = [
      {
        title: "Explorer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
      },
      {
        title: "Observer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311435/RWAPros/Badges/observer_gs5nck.svg",
      },
    ];
  } else {
    userStat.tieredProgression = [
      {
        title: "Observer",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311435/RWAPros/Badges/observer_gs5nck.svg",
      },
    ];
  }

  // for Skill & Reputation-Based Badges
  if (
    userStat.totalThreadPosted >= 75 &&
    userStat.totalCommentGiven >= 500 &&
    userStat.totalLikeReceived >= 500 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 25000
  ) {
    userStat.reputation = [
      {
        title: "Pro",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311456/RWAPros/Badges/pros_a1ylf6.svg",
      },
      {
        title: "Expert",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
      },
      {
        title: "Top contributor",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/top_contributor_voskr4.svg",
      },
    ];
  } else if (
    userStat.totalThreadPosted >= 100 &&
    userStat.totalCommentGiven >= 750 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 200 &&
    userStat.totalViewReceived >= 50000
  ) {
    userStat.reputation = [
      {
        title: "Expert",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/expllorer_h5ka8a.svg",
      },
      {
        title: "Top contributor",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/top_contributor_voskr4.svg",
      },
    ];
  } else if (
    userStat.totalThreadPosted >= 150 &&
    userStat.totalCommentGiven >= 1000 &&
    userStat.totalLikeReceived >= 2500 &&
    userStat.totalFollower >= 400 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.reputation = [
      {
        title: "Top contributor",
        image:
          "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/top_contributor_voskr4.svg",
      },
    ];
  } else {
    userStat.reputation = [];
  }

  // For social influencer
  if (
    differenceTwoDates(user.createdAt, new Date()) <= 30 &&
    userStat.totalThreadPosted >= 5 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 25 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.star = {
      title: "Rising start",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311457/RWAPros/Badges/rising_star_yp1qfg.svg",
    };
  } else {
    userStat.star = null;
  }

  // For influencer
  if (
    userStat.totalLikeReceived >= 2000 &&
    userStat.totalFollower >= 500 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.influence = {
      title: "Influencer",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311437/RWAPros/Badges/influencer_imfh3g.svg",
    };
  } else {
    userStat.influence = null;
  }

  // For quality badge
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 90 &&
    userStat.totalThreadPosted >= 20 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.quality = {
      title: "Trusted member",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311434/RWAPros/Badges/trusted_member_jpcsha.svg",
    };
  } else {
    userStat.quality = null;
  }

  // For VIP badge
  if (userStat.totalFollower >= 1000 && userStat.totalViewReceived >= 250000) {
    userStat.vip = {
      title: "VIP",
      image:
        "https://res.cloudinary.com/dbtsrjssc/image/upload/v1754311642/RWAPros/Badges/vip_zmhorp.svg",
    };
  } else {
    userStat.vip = null;
  }

  return userStat;
};

const calculateUserAllBadgesWithoutImg = (user, userStat) => {
  // for Tiered Progression Badges
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 360 &&
    userStat.totalThreadPosted >= 50 &&
    userStat.totalCommentGiven >= 300 &&
    userStat.totalLikeReceived >= 250 &&
    userStat.totalFollower >= 50 &&
    userStat.totalViewReceived >= 10000
  ) {
    userStat.tieredProgression = [
      "Veteran",
      "Contributor",
      "Explorer",
      "Observer",
    ];
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 30 &&
    userStat.totalThreadPosted >= 10 &&
    userStat.totalCommentGiven >= 50 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 10 &&
    userStat.totalViewReceived >= 1000
  ) {
    userStat.tieredProgression = ["Contributor", "Explorer", "Observer"];
  } else if (
    differenceTwoDates(user.createdAt, new Date()) >= 1 &&
    userStat.totalThreadPosted >= 1 &&
    userStat.totalCommentGiven >= 1
  ) {
    userStat.tieredProgression = ["Explorer", "Observer"];
  } else {
    userStat.tieredProgression = ["Observer"];
  }

  // for Skill & Reputation-Based Badges
  if (
    userStat.totalThreadPosted >= 75 &&
    userStat.totalCommentGiven >= 500 &&
    userStat.totalLikeReceived >= 500 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 25000
  ) {
    userStat.reputation = ["Pro", "Expert", "Top contributor"];
  } else if (
    userStat.totalThreadPosted >= 100 &&
    userStat.totalCommentGiven >= 750 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 200 &&
    userStat.totalViewReceived >= 50000
  ) {
    userStat.reputation = ["Expert", "Top contributor"];
  } else if (
    userStat.totalThreadPosted >= 150 &&
    userStat.totalCommentGiven >= 1000 &&
    userStat.totalLikeReceived >= 2500 &&
    userStat.totalFollower >= 400 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.reputation = ["Top contributor"];
  } else {
    userStat.reputation = [];
  }

  // For social influencer
  if (
    differenceTwoDates(user.createdAt, new Date()) <= 30 &&
    userStat.totalThreadPosted >= 5 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 50 &&
    userStat.totalFollower >= 25 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.star = "Rising start";
  } else {
    userStat.star = "";
  }

  // For influencer
  if (
    userStat.totalLikeReceived >= 2000 &&
    userStat.totalFollower >= 500 &&
    userStat.totalViewReceived >= 100000
  ) {
    userStat.influence = "Influencer";
  } else {
    userStat.influence = "";
  }

  // For quality badge
  if (
    differenceTwoDates(user.createdAt, new Date()) >= 90 &&
    userStat.totalThreadPosted >= 20 &&
    userStat.totalCommentGiven >= 20 &&
    userStat.totalLikeReceived >= 1000 &&
    userStat.totalFollower >= 100 &&
    userStat.totalViewReceived >= 5000
  ) {
    userStat.quality = "Trusted member";
  } else {
    userStat.quality = "";
  }

  // For VIP badge
  if (userStat.totalFollower >= 1000 && userStat.totalViewReceived >= 250000) {
    userStat.vip = "VIP";
  } else {
    userStat.vip = "";
  }

  return userStat;
};

module.exports = {
  calculateForBadge,
  calculateForBadgeWithoutImage,
  calculateUserAllBadges,
  calculateUserAllBadgesWithoutImg,
};
