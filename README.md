# Minecraft-Block-Renderer

Block Renderer is a Web Minecraft block... renderer (yeah, really).  
The ultimate goal is to be able to display all Minecraft models, export them to image, import his own resource pack...
Resources (models, textures, etc) are provided by a [REST API backend](https://github.com/theogiraudet/Backend-Block-Renderer).

![](/docs/images/main_image.png)

A hosted version is disponible [here](https://dispenser.gunivers.net/block-renderer/). Thanks to Gunivers for supporting and hosting this project!

## Current features
- Display all Minecraft 1.18.2 block models (excluding entity blocks)
- Display animated textures (interpolated or not)
- Display models with undefined textures by displaying wireframe of faces without textures
- Auto-completion on the model input field to list supported models

## Versions

|  Versions | Support          |                                    Features                                    |
|-----------|------------------|--------------------------------------------------------------------------------|
| 1.3.X     | Planned          | Load custom resource pack                                                      |
| 1.2.X     | In development   | Possibility to select block instead of model and to switch between blockstates |
| 1.1.X     | Current          | Manage animated textures                                                       |
| 1.0.X     | Maintenance only | Load and render all types of block model                                       |
