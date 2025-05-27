// const expect = require("chai").expect;
// const request = require("request");
// const baseUrl = "http://localhost:4910";
// const mongodb = require("mongodb");
// const { getDb } = require("../services/db-member");
// const dbController = require("../services/db-member");

// describe("Wishlist Feature", function () {
//   let testMemberId = "681ebfd09a6cb70872c2d9ee"; //Sujay's ID
//   let testAdId = "68213b6e4d41529b0e1e2d9e";//real ad ID FORD
//   const collectionName = "member_favorites";

//   before(async function () {
//     const db = getDb();
//     await db.collection(collectionName).deleteMany({ memberId: testMemberId });
//   });

//   it("should add ad to wishlist", async function () {
//     await dbController.addToWishlist(testMemberId, testAdId);
//     const fav = await getDb().collection(collectionName).findOne({ memberId: testMemberId, adId: testAdId });
//     expect(fav).to.not.be.null;
//   });

//   it("should not duplicate wishlist entries", async function () {
//     await dbController.addToWishlist(testMemberId, testAdId);
//     const entries = await getDb().collection(collectionName).find({ memberId: testMemberId, adId: testAdId }).toArray();
//     expect(entries.length).to.equal(1);
//   });

//   it("should remove ad from wishlist", async function () {
//     await dbController.removeFromWishlist(testMemberId, testAdId);
//     const fav = await getDb().collection(collectionName).findOne({ memberId: testMemberId, adId: testAdId });
//     expect(fav).to.be.null;
//   });

//   it("should return an empty list after removal", async function () {
//     const result = await dbController.getWishlist(testMemberId);
//     expect(result).to.be.an("array").that.is.empty;
//   });
// });
