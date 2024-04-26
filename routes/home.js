const express = require("express");
const router = express.Router();
const Note = require("../models/notes");
const { isLoggedIn } = require("../middleware");



// Home route
router.get("/", (req, res) => {
  res.render("./pages/home.ejs");
});

// Show notes route
router.get("/show", isLoggedIn, async (req, res, next) => {
  try {
    let abc = await Note.find({ user: req.user.id });
    res.render("./pages/show.ejs", { abc });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// // View specific note route
// router.get("/:id", isLoggedIn, async (req, res, next) => {
//   try {
//     let { id } = req.params;
//     let note = await Note.findById(id);
//     console.log(note);
//     res.render("./pages/popUp.ejs",{note});
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// New note route
router.get("/new", isLoggedIn, (req, res) => {
  res.render("./pages/new.ejs");
});

// Create new note route
router.post("/", async (req, res) => {
  try {
    let newNote = await new Note({
      title: req.body.title,
      content: req.body.content,
      user: req.user.id,
    });
    await newNote.save();
    res.redirect("/notes/show");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// // View specific note route
// router.get("/view/:id", isLoggedIn, async (req, res, next) => {
//   try {
//       const note = await Note.findById(req.params.id);
//       if (!note) {
//           return res.status(404).json({ error: "Note not found" });
//       }
//       res.json(note);
//   } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "Internal Server Error" });
//   }
// });
// Edit note route
router.get("/show/:id/edit", isLoggedIn, async (req, res) => {
  try {
    let { id } = req.params;
    let note = await Note.findById(id);
    res.render("./pages/edit.ejs", { note });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Update note route
router.put("/show/:id", isLoggedIn, async (req, res) => {
  try {
    let { id } = req.params;
    let note = await Note.findByIdAndUpdate(id, { ...req.body }, { new: true });
    req.flash("success", "Updated successfully");
    res.redirect("/notes/show");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Delete note route
router.delete("/show/:id", async (req, res) => {
  try {
    let { id } = req.params;
    let note = await Note.findByIdAndDelete(id);
    req.flash("success", "Deleted successfully");
    res.redirect("/notes/show");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Search notes route
router.get("/search", isLoggedIn, async (req, res) => {
  let searchQuery = req.query.search;
  try {
    let abc = await Note.find({
      "$or": [
        { "title": { $regex: searchQuery, $options: "i" } }
      ],
      user: req.user.id
    });
    if (abc.length > 0) {
      console.log("Present");
    } else {
      req.flash("error", "Not available");
      res.redirect("/notes/show");
    }
    res.render("./pages/show.ejs", { abc });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
