Documentation for active ruleset of the Sunder TTRPG. GitHub website hosting CI using MkDocs and ObsidianMD.

# Development Environment Setup

**Using:** Python 3.12.3

## Creating the Virtual Deployment Environment

You will need to set up a virtual environment (venv) for testing the website on MkDocs. Run the following commands after installing the necessary Python version:

```shell
python -m venv .venv
./venv/Scripts/Activate.ps1
```

## Installing Dependencies

Make sure your `pip` is up to date:

```shell
py -m pip install --upgrade pip
```

Download MkDocs and its dependencies:

```shell
pip install mkdocs mkdocs-material mkdocs-callouts mkdocs-obsidian-support-plugin mkdocs-roamlinks-plugin
pip install pymdown-extensions
```

