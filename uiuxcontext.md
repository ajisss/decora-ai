# PROJECT_CONTEXT.md

# Decor-AI Vision

> Read this document before making any product, design, frontend, backend, or AI implementation decision.
>
> This document is the single source of truth for Decor-AI.

---

# 1. Product Vision

Decor-AI is an AI-powered wedding decoration planning platform.

Our goal is NOT to build another AI image generator.

Our goal is to help couples, wedding organizers, and decoration vendors transform abstract wedding ideas into production-ready decoration concepts.

Instead of asking users to write AI prompts, Decor-AI guides them through a structured workflow that automatically generates optimized prompts, produces consistent wedding visualizations, analyzes decoration items, and prepares vendor-ready outputs.

The experience should feel like designing a wedding, not operating an AI.

---

# 2. Product Mission

Transform

Idea

↓

Wedding Concept

↓

AI Visualization

↓

Decoration Analysis

↓

Vendor Discussion

↓

Real Wedding

Within minutes.

---

# 3. Target Users

Primary

• Bride & Groom

Need inspiration and confidence before meeting vendors.

---

Secondary

• Wedding Organizer

Need to generate concepts quickly during client meetings.

---

Third

• Decoration Vendors

Need a clear visual reference and decoration checklist.

---

# 4. Core Product Philosophy

Decor-AI should always feel

✓ Guided

✓ Visual

✓ Fast

✓ Inspiring

✓ Minimal

✓ AI-native

Never feel like

✗ Prompt engineering

✗ Technical software

✗ Enterprise dashboard

✗ AI playground

---

# 5. Design Principles

## 5.1 Structure Before Prompt

Never ask users to write prompts first.

Always collect structured information.

Theme

↓

Venue

↓

Budget

↓

Palette

↓

Additional Notes

↓

Optimized Prompt

---

## 5.2 Learning by Doing

Users learn naturally while using the product.

Avoid documentation.

Avoid tutorials.

Guide through interaction.

---

## 5.3 Visual First

Humans understand images faster than text.

Every important decision should have visual feedback.

---

## 5.4 AI Should Be Invisible

AI powers the experience.

Users should think they are designing a wedding.

Not talking to AI.

---

## 5.5 Progressive Disclosure

Only show what users need right now.

Hide advanced settings.

Never overwhelm beginners.

---

## 5.6 Every Screen Has One Primary Action

Landing

↓

Create Project

Wizard

↓

Generate

Canvas

↓

Analyze

Analyze

↓

Export

Never compete with multiple CTAs.

---

# 6. MVP Scope

P0

• Guided Wizard

• GPT Image Generation

• Project Saving

• Canvas

• Decoration Analysis

• Export PNG

---

P1

• Project Library

• PDF Vendor Brief

• Reference Image

---

P2

• Item Editing

• Compare Versions

• Vendor Marketplace

---

Not MVP

• AI Model Training

• LoRA

• ControlNet

• AR

• Video

• 3D

---

# 7. User Journey

Landing

↓

New Project

↓

Guided Wizard

↓

Generate Design

↓

Canvas

↓

Regenerate (optional)

↓

Analyze Decoration

↓

Edit Checklist

↓

Export

↓

Vendor Discussion

---

# 8. Information Architecture

Landing

Projects

Wizard

Canvas

Analysis

Export

Settings

Maximum navigation depth

3 levels.

---

# 9. Screen Definitions

## Landing

Purpose

Explain value.

Primary CTA

Create Wedding Design

---

## Wizard

Purpose

Collect wedding information.

Required

Theme

Venue

Optional

Budget

Palette

Guest Count

Notes

Reference Images

---

## Prompt Preview

Purpose

Build trust.

Users may edit the prompt.

Prompt editing is optional.

---

## Canvas

Main workspace.

Features

Large Preview

Zoom

Regenerate

History

Analyze

Export

Future

Item Editing

---

## Analysis

Convert images into structured decoration items.

Every item must be editable.

Categories

Stage

Backdrop

Flowers

Lighting

Tables

Guest Chairs

VIP Chairs

Walkway

Reception

LED Screen

Others

---

## Export

PNG

Vendor Brief

Future

PDF

Presentation

---

# 10. UX Rules

Always

Show progress

Explain waiting

Allow retry

Save automatically

Provide visual feedback

Never

Block users

Lose data

Hide failures

Require prompt knowledge

---

# 11. Empty States

Every page requires

Illustration

Explanation

Primary CTA

Example

"No wedding concepts yet."

Start creating your first wedding design.

---

# 12. Error States

Errors should explain

What happened

Why

How to recover

Never display

API responses

Stack traces

Technical messages

---

# 13. Success States

Every important action should provide feedback.

Examples

✓ Project Saved

✓ Design Generated

✓ Analysis Complete

✓ Export Ready

---

# 14. AI Behavior

AI should behave like a design assistant.

Never like ChatGPT.

Always

Guide

Suggest

Improve

Never expose internal prompts.

---

# 15. Technical Principles

Frontend

React

Vite

TailwindCSS

Backend

Node.js

Express

AI

GPT Image API

GPT Vision

Storage

JSON

CSV

Future

Database

Never build unnecessary infrastructure.

---

# 16. Development Principles

Prefer

Simple

Composable

Reusable

Maintainable

Avoid

Overengineering

Premature optimization

Complex architecture

Microservices

Docker-heavy workflows

The MVP should be executable on a normal laptop.

---

# 17. Component Principles

Every reusable UI should become a component.

Examples

Theme Card

Palette Picker

Wizard Step

Generation Card

Analysis Panel

Checklist Item

Export Dialog

Loading Overlay

Empty State

Error State

---

# 18. Engineering Rules

Never hardcode prompts.

Always generate prompts from structured user input.

Never expose API keys.

Always support retries.

Persist user projects automatically.

Never lose user work.

---

# 19. Coding Workflow

Before implementing any feature

1. Understand user goal

2. Check if the feature already exists

3. Reuse components whenever possible

4. Keep implementation simple

5. Handle

Loading

Empty

Error

Success

6. Test manually

7. Refactor only after the feature works

---

# 20. AI Coding Agent Instructions

When implementing features

Never redesign the product.

Never change the user flow.

Never introduce new architecture without strong justification.

Always prioritize shipping over perfection.

If multiple solutions exist

Choose the simplest solution.

Prefer readable code over clever code.

Prefer composition over abstraction.

Every feature should be independently testable.

---

# 21. Definition of Done

A feature is complete only if

✓ Business goal achieved

✓ UX completed

✓ Responsive

✓ Loading handled

✓ Empty state handled

✓ Error state handled

✓ Success state handled

✓ Accessible

✓ Reusable

✓ Code reviewed

✓ Manual testing completed

Otherwise

The feature is NOT done.

---

# 22. Future Vision

Decor-AI should eventually become

The operating system for wedding decoration planning.

Users should be able to

Imagine

Visualize

Analyze

Estimate

Collaborate

Export

Execute

Without ever needing prompt engineering.

---

# Final Rule

Whenever making a product, UX, engineering, or AI decision, ask:

"Does this help users design their wedding faster, easier, and with more confidence?"

If the answer is no,

don't build it.