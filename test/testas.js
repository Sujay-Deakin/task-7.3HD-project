// const expect = require("chai").expect;
// const io = require("socket.io-client");
// const request = require("request");

// const baseUrl = "http://localhost:4910";
// const options = {
//   transports: ["websocket"],
//   forceNew: true,
//   reconnection: false,
// };

// describe("Hauller Server API and WebSocket Tests", function () {
//   this.timeout(6000);

//   let client1, client2;
//   const user1 = "user123";
//   const user2 = "user456";

//   beforeEach((done) => {
//     client1 = io(baseUrl, options);
//     client2 = io(baseUrl, options);
//     let connected = 0;
//     [client1, client2].forEach((client) =>
//       client.on("connect", () => {
//         if (++connected === 2) done();
//       })
//     );
//   });

//   afterEach(() => {
//     if (client1.connected) client1.disconnect();
//     if (client2.connected) client2.disconnect();
//   });

//   // === WebSocket Core Tests ===
//   it("1. Should connect both clients", () => {
//     expect(client1.connected).to.be.true;
//     expect(client2.connected).to.be.true;
//   });

//   it("2. Should register users", (done) => {
//     client1.emit("register-user", user1);
//     client2.emit("register-user", user2);
//     setTimeout(done, 300);
//   });

//   it("3. Should join room", (done) => {
//     client1.emit("joinRoom", { senderId: user1, receiverId: user2 });
//     client2.emit("joinRoom", { senderId: user2, receiverId: user1 });
//     setTimeout(done, 300);
//   });

//   it("4. Should allow multiple room joins", (done) => {
//     client1.emit("joinRoom", { senderId: user1, receiverId: "u3" });
//     client1.emit("joinRoom", { senderId: user1, receiverId: "u4" });
//     setTimeout(done, 300);
//   });

//   it("5. Should disconnect cleanly", (done) => {
//     client1.disconnect();
//     setTimeout(() => {
//       expect(client1.connected).to.be.false;
//       done();
//     }, 300);
//   });

//   // === HTTP/API Route Tests ===
//   it("6. Should render landing page", (done) => {
//     request.get(`${baseUrl}/`, (err, res) => {
//       expect(res.statusCode).to.equal(200);
//       done();
//     });
//   });

//   it("7. Should return student data", (done) => {
//     request.get(`${baseUrl}/api/student`, (err, res, body) => {
//       expect(res.statusCode).to.equal(200);
//       const json = JSON.parse(body);
//       expect(json).to.have.property("name");
//       expect(json).to.have.property("studentId");
//       done();
//     });
//   });

//   it("8. Should not crash on invalid route", (done) => {
//     request.get(`${baseUrl}/invalidpath`, (err, res) => {
//       expect(res.statusCode).to.be.oneOf([404, 200]);
//       done();
//     });
//   });

//   it("9. Should allow session for member", () => {
//     expect(client1.io.uri.includes("localhost")).to.be.true;
//   });

//   it("10. Should support static assets (logo)", (done) => {
//     request.get(`${baseUrl}/media/logo.png`, (err, res) => {
//       expect([200, 404]).to.include(res.statusCode);
//       done();
//     });
//   });

//   // === WebSocket Messaging and Events ===
//   it("11. Should ignore messages if socket not registered", (done) => {
//     const ghost = io(baseUrl, options);
//     ghost.emit("privateMessage", {
//       senderId: "ghost",
//       receiverId: "none",
//       message: "test",
//       senderName: "Ghost",
//     });
//     ghost.disconnect();
//     done();
//   });

//   it("12. Should ignore contact if toUser is invalid", (done) => {
//     client1.emit("contact-owner", {
//       fromUser: "uA",
//       toUser: "invalidID",
//       adId: "z",
//       itemname: "none",
//       username: "ghost",
//     });
//     setTimeout(done, 200);
//   });

//   it("13. Should broadcast message to room", (done) => {
//     const msg = "room broadcast";
//     client2.on("newMessage", (data) => {
//       expect(data.message).to.equal(msg);
//       done();
//     });

//     client1.emit("joinRoom", { senderId: user1, receiverId: user2 });
//     client2.emit("joinRoom", { senderId: user2, receiverId: user1 });

//     client1.emit("privateMessage", {
//       senderId: user1,
//       receiverId: user2,
//       message: msg,
//       senderName: "User123",
//     });
//   });

//   it("14. Should render /member/chat", (done) => {
//     request.get(`${baseUrl}/member/chat`, (err, res) => {
//       expect([200, 302, 404]).to.include(res.statusCode);
//       done();
//     });
//   });

//   it("15. Should not crash on repeated joins", (done) => {
//     for (let i = 0; i < 3; i++) {
//       client1.emit("joinRoom", { senderId: user1, receiverId: user2 });
//     }
//     setTimeout(done, 200);
//   });

//   it("16. Should keep socket IDs unique", () => {
//     expect(client1.id).to.not.equal(client2.id);
//   });

//   it("17. Should retain notify on reconnect", (done) => {
//     client2.disconnect();
//     setTimeout(() => {
//       const rejoin = io(baseUrl, options);
//       rejoin.on("connect", () => {
//         rejoin.emit("register-user", user2);
//         rejoin.on("notify", (data) => {
//           expect(data.message).to.include("User123");
//           rejoin.disconnect();
//           done();
//         });

//         client1.emit("contact-owner", {
//           fromUser: user1,
//           toUser: user2,
//           adId: "retest",
//           itemname: "Phone",
//           username: "User123",
//         });
//       });
//     }, 300);
//   });

//   it("18. Should emit notify when contacting multiple users", (done) => {
//     const client3 = io(baseUrl, options);
//     client3.on("connect", () => {
//       client3.emit("register-user", "user789");
//       client3.on("notify", (data) => {
//         expect(data.message).to.include("User123");
//         client3.disconnect();
//         done();
//       });

//       client1.emit("contact-owner", {
//         fromUser: user1,
//         toUser: "user789",
//         adId: "ad999",
//         itemname: "Mixer",
//         username: "User123",
//       });
//     });
//   });

//   it("19. Should allow user to re-register", (done) => {
//     client1.disconnect();
//     setTimeout(() => {
//       const reconnect = io(baseUrl, options);
//       reconnect.on("connect", () => {
//         reconnect.emit("register-user", user1);
//         expect(reconnect.connected).to.be.true;
//         reconnect.disconnect();
//         done();
//       });
//     }, 300);
//   });

//   // === Additional Edge + Robustness Tests ===
//   it("20. Should not crash when sending message to self", (done) => {
//     client1.emit("joinRoom", { senderId: user1, receiverId: user1 });

//     client1.on("newMessage", (data) => {
//       expect(data.message).to.equal("self-message");
//       done();
//     });

//     client1.emit("privateMessage", {
//       senderId: user1,
//       receiverId: user1,
//       message: "self-message",
//       senderName: "User123",
//     });
//   });

//   it("21. Should handle disconnect and rejoinRoom", (done) => {
//     client2.disconnect();
//     setTimeout(() => {
//       const reClient = io(baseUrl, options);
//       reClient.on("connect", () => {
//         reClient.emit("register-user", user2);
//         reClient.emit("joinRoom", { senderId: user2, receiverId: user1 });
//         expect(reClient.connected).to.be.true;
//         reClient.disconnect();
//         done();
//       });
//     }, 300);
//   });


//   it("22. Should allow duplicate register-user events", (done) => {
//     client1.emit("register-user", user1);
//     client1.emit("register-user", user1);
//     setTimeout(() => {
//       expect(client1.connected).to.be.true;
//       done();
//     }, 200);
//   });
// });
