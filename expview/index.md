---
layout: page
title: ExpView
subtitle: A terminal-based analytics and visualization tool for datasets.
cover-img: ["assets/images/expview-slide1.png",
            "assets/images/expview-slide2.png",
            "assets/images/expview-slide3.png"]
gh-repo: puraminy/expview
gh-badge: [star, fork, watch]
full-width: true
---

# ExpView

**ExpView** is a terminal-based analytics and visualization tool inspired by Excel.  
Designed for developers and data scientists, it displays pandas DataFrames directly in the terminal using the **Curses** library — with fast navigation, shortcut keys, and instant refresh.

ExpView can integrate with experiment pipelines: pass variable configurations to external programs, collect CSV/TSV/JSON outputs, manage configurations, and visualize results with matplotlib to analyze parameter effects and performance trends.

## Installation

```bash
pip install expview
````

This installs ExpView and its dependencies.

## Quick Start

Go to `examples` folder, and run:

```bash
expview results.csv
```

If you have multiple datasets in a folder, just run:

```bash
expview
```

For full documentation, refer to the [GitHub homepage](https://github.com/puraminy/expview).

