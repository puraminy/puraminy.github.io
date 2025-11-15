---
layout: page
title: NodCast
subtitle: Study Smarter
cover-img: ["assets/images/nodcast-slide1.png"]
gh-repo: puraminy/nodcast
gh-badge: [star, fork, watch]
full-width: true
---

# NodCast

NodCast is a text-based reading environment built for focused, concentrated study.  
It blends keyboard-driven navigation with small textual reactions—*nods*—to create an active reading experience instead of passive scanning.

You can use NodCast to search, study, and manage scientific papers or any article.  
It gives you summaries, lets you view figures in a browser, download PDFs, and annotate text fragments.  
But the real innovation is how it turns reading into a dialogue.

---

# The Idea Behind NodCast

<blockquote>
Instead of passively scanning lines, you respond to each sentence with short written signals called <strong>nods</strong>.
</blockquote>

A nod is a quick acknowledgment—like “I see,” “hmm,” or “wait, what?”—typed instead of spoken.  
NodCast uses these signals to understand what you grasp, what confuses you, and which parts matter.

Below is an example of how a selected nod can be highlighted visually:

<div style="padding:10px; border-left:4px solid #4CAF50; margin:10px 0; background:#f5fff5;">
<strong>Selected nod:</strong> <span style="font-weight:bold; color:#2E7D32;">I see!</span>
</div>

Or a reflective nod:

<div style="padding:10px; border-left:4px solid #E65100; margin:10px 0; background:#fff7f0;">
<strong>Selected nod:</strong> <span style="font-weight:bold; color:#bf360c;">wait, what?</span>
</div>

---

# Q&A: What Are Nods?

### **Q: What exactly is a nod?**  
A nod is a short textual signal you give after reading a sentence or fragment—similar to replying “okay” or “I see” while listening to someone.

### **Q: Why written nods?**  
Because writing them makes your reading active. A nod forces a tiny moment of metacognition: *Did I understand this? Did it matter? Did it confuse me?*

### **Q: What types of nods can I use?**  
NodCast uses two broad categories:

#### Affirming nods  
These show understanding or interest.

<div style="margin-left:20px;">
• <strong>okay</strong> – the point is mostly clear  
• <strong>I see!</strong> – fully understood  
• <strong>interesting!</strong> – contains a useful idea  
• <strong>important!</strong> – significant, memorable  
</div>

#### Reflective nods  
These show uncertainty or confusion.

<div style="margin-left:20px;">
• <strong>okay so?</strong> – meaning clear, purpose unclear  
• <strong>didn't get, but okay</strong> – unclear but not critical  
• <strong>didn't get</strong> – unclear and confusing  
• <strong>needs research</strong> – terminology or idea requires follow-up  
</div>

### **Q: Can I add my own nods?**  
Yes. You can edit or create custom nods anytime. NodCast learns from your personal style.

### **Q: How does NodCast use these nods?**  
NodCast observes patterns in your nods and questions.  
Creators of NodCast articles receive this feedback.  
Articles are also scored based on user nods, and future versions may adapt reading speed or difficulty dynamically.

---

# How to Use NodCast

### Navigating

When you open an article, NodCast highlights the first sentence.  
Use:

- `<Down>` — expand your current selection  
- `<Up>` — shrink / go back  
- `<Right>` — cycle through **affirmative** nods  
- `<Left>` — cycle through **reflective** nods  
- `<Enter>` — confirm / open items  
- `:` — add a comment  
- `?` — add a question  
- `n` — new segment  
- `z` — toggle auto-mode  
- `s` — read aloud (TTS)  

After selecting a fragment, you must enter a nod before moving on.

---

# Working With Comments

Press `:` to write a comment.  
A bar appears, letting you type a single-line note.

For multiline comments:

- Press `>` to insert a new line  
- Press `<` to remove a line  
- Use arrows to navigate between lines  

---

# Categorizing Articles

You can give nods to entire articles too (e.g., “important,” “review later”).  
To do this: select the title (press `<Home>`), then use `<Left>`.

Tags can also be added for better organization.

