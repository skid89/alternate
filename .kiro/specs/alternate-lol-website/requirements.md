# Requirements Document

## Introduction

A complete, modern, premium-looking website for alternate.lol — a Roblox script for Da Hood and Hood Customs. The website consists of two main pages: the main product page (alternate.lol) showcasing features, media, reseller info, and status; and a link service page (alternate.lol/link) providing customizable profile cards similar to Guns.lol. The design uses a black, white, and Valorant-pink colour scheme with smooth animations, glassmorphism, particles, snowfall, mouse-parallax effects, animated backgrounds, slide animations, blur effects, and fully responsive layout.

## Glossary

- **Website**: The complete alternate.lol web application comprising the Main_Page and Link_Page
- **Main_Page**: The primary landing page at alternate.lol displaying product information, navigation, and feature showcase
- **Link_Page**: The secondary page at alternate.lol/link providing a customisable profile card service
- **Dashboard**: The authenticated user interface within Link_Page for managing profile card settings
- **Features_Section**: A tab-based interface on Main_Page that mirrors the script's UI categories and controls
- **Status_Section**: A section on Main_Page displaying live system health, Discord information, and update logs
- **Reseller_Section**: A section on Main_Page showing Discord server info and reseller instructions
- **Media_Section**: A section on Main_Page showing requirements for TikTok and YouTube media partners
- **Notification_Banner**: A slide-in notification displayed at the top of the page before external redirects
- **Card_Editor**: The Dashboard component allowing users to customise their profile card layout and style
- **Parallax_Effect**: A mouse-following dampening effect applied to page elements
- **Glassmorphism**: A frosted-glass visual effect using backdrop blur and semi-transparent backgrounds
- **Valorant_Pink**: The accent colour #FF4655 used throughout the website design
- **Snowfall_Effect**: An animated particle system simulating snowfall in the background
- **Typewriter_Animation**: A character-by-character text reveal effect with cursor blinking

## Requirements

### Requirement 1: Main Page Hero Section

**User Story:** As a visitor, I want to see an engaging hero section with animated product imagery and branding, so that I immediately understand what alternate is.

#### Acceptance Criteria

1. THE Main_Page SHALL display the gui.png image positioned in the right half of the hero section, occupying no more than 50% of the hero section width
2. WHEN the user moves the mouse within the viewport, THE Main_Page SHALL apply a Parallax_Effect to the gui.png image that combines vertical floating offset (maximum 10px), rotation (maximum 5 degrees), and dampened tracking toward the cursor position (easing factor between 0.02 and 0.1)
3. THE Main_Page SHALL display the heading "/alternate" on the left side of the hero section at a font size of at least 48px
4. WHEN the Typewriter_Animation triggers on a repeating cycle of 4 seconds, THE Main_Page SHALL erase the heading text character-by-character at a rate of 1 character per 100ms, then type the alternate text ("@2jkoni" or "/alternate") character-by-character at the same rate
5. THE Main_Page SHALL display the tagline "The best vertical legit Roblox script for Da Hood and Hood Customs" below the heading
6. THE Main_Page SHALL display navigation links (Buy, Reseller, Media, Features, Status) below the tagline, each rendered as a clickable anchor that scrolls or navigates to its corresponding page section
7. WHEN the Main_Page finishes loading, THE Main_Page SHALL display the hero section with the gui.png image and heading visible within 1 second of page load completion

### Requirement 2: External Link Redirect Notification

**User Story:** As a visitor, I want to be notified before being redirected to an external site, so that I am aware I am leaving alternate.lol.

#### Acceptance Criteria

1. WHEN a user clicks a link whose destination host differs from alternate.lol, THE Notification_Banner SHALL slide in from the top of the viewport over a duration of 300 milliseconds
2. WHILE the Notification_Banner is visible, THE Notification_Banner SHALL display a progress bar that fills over a total duration of 5 seconds, indicating time remaining before redirect
3. WHILE the Notification_Banner is visible, THE Notification_Banner SHALL display the destination URL, truncated to a maximum of 60 characters with an ellipsis if longer
4. WHEN the progress bar reaches full completion, THE Website SHALL redirect the user to the external URL
5. IF the user clicks a cancel button on the Notification_Banner before the progress bar completes, THEN THE Notification_Banner SHALL dismiss without redirecting and the user SHALL remain on the current page
6. IF the user clicks another external link while the Notification_Banner is already visible, THEN THE Notification_Banner SHALL reset the progress bar and update the displayed destination URL to the newly clicked link

### Requirement 3: Buy Button Navigation

**User Story:** As a potential customer, I want to access the purchase page easily, so that I can buy the script.

#### Acceptance Criteria

1. WHEN the user clicks the Buy link, THE Website SHALL trigger the Notification_Banner with the destination URL set to https://alternateshop.mysellauth.com/
2. THE Buy link SHALL be rendered as a visually distinct clickable element within the navigation links below the tagline
3. WHEN the Notification_Banner progress bar completes after clicking the Buy link, THE Website SHALL open https://alternateshop.mysellauth.com/ in a new browser tab

### Requirement 4: Reseller Section

**User Story:** As a potential reseller, I want to see reseller information and access the Discord ticket system, so that I can become a reseller.

#### Acceptance Criteria

1. WHEN the user navigates to the Reseller section, THE Reseller_Section SHALL display a Discord server preview card containing the server name, member count placeholder, and server icon for discord.gg/alternate
2. THE Reseller_Section SHALL apply mouse-based Parallax_Effect to the Discord preview card with a maximum rotation of 5 degrees and translation of 10px in response to cursor position
3. THE Reseller_Section SHALL display an "Open Ticket" button styled consistently with the website's Valorant_Pink accent colour
4. WHEN the user clicks the Open Ticket button, THE Website SHALL trigger the Notification_Banner with the destination URL set to https://discord.com/channels/1499128437074300940/1522493351700729866
5. THE Reseller_Section SHALL display the text "Must buy in packages, lifetime costs $8." as a visible paragraph below the Discord preview card

### Requirement 5: Media Section

**User Story:** As a content creator, I want to see media partnership requirements, so that I know if I qualify.

#### Acceptance Criteria

1. WHEN the user navigates to the Media section, THE Media_Section SHALL display a TikTok requirements card listing: minimum 150 followers and minimum 50 likes per video
2. THE Media_Section SHALL display a YouTube requirements card listing: minimum 50 subscribers and minimum 25 likes per video
3. THE Media_Section SHALL display each platform's requirements in a separate visually distinct card with the platform icon and name

### Requirement 6: Features Section

**User Story:** As a potential customer, I want to browse all script features in an interactive UI, so that I can evaluate the product before purchasing.

#### Acceptance Criteria

1. WHEN the user navigates to the Features section, THE Features_Section SHALL display a tab-based interface with the tabs: Combat, Visuals, Misc, and Settings, with the Combat tab selected by default
2. THE Features_Section Combat tab SHALL display sub-tabs: Aimbot, Silent, and Aimbot+
3. THE Features_Section Visuals tab SHALL display sub-tabs: ESP/Chams and World
4. THE Features_Section Misc tab SHALL display sub-tabs: Misc and Playerlist
5. THE Features_Section Settings tab SHALL display sub-tabs: Main
6. WHEN a sub-tab is selected, THE Features_Section SHALL display sections containing toggles, sliders, dropdowns, colour pickers, and keybind indicators arranged in a two-column layout with left and right columns each occupying 50% of the content width
7. THE Features_Section SHALL use the following section names distributed across their respective sub-tabs: Aimbot, Silent Aim, Target / Main, Settings, Aimbot+, ESP, Chams, Lighting, Weather, Skybox, Materials, Movement, Triggerbot / Skins, Avatar, Player List, Actions, Configs, Menu, Notifications, and Themes
8. WHEN switching between tabs or sub-tabs, THE Features_Section SHALL apply a fade animation with a duration between 150ms and 400ms
9. THE Features_Section SHALL render all controls as non-interactive visual representations that display the script's settings layout without accepting user input

### Requirement 7: Status Section

**User Story:** As a user, I want to see real-time status information about the script and community, so that I know if everything is operational.

#### Acceptance Criteria

1. WHEN the user navigates to the Status section, THE Status_Section SHALL display the Discord server banner image and server icon fetched from the Discord server for discord.gg/alternate
2. THE Status_Section SHALL display a "Join" button that, when clicked, triggers the external redirect notification and navigates to the Discord server invite URL
3. THE Status_Section SHALL display the current bot status as a colour-coded indicator (green for online, red for offline)
4. THE Status_Section SHALL display the current script status as a colour-coded indicator (green for working, red for down)
5. THE Status_Section SHALL display the supported Roblox version as text
6. THE Status_Section SHALL display the current website status as a colour-coded indicator (green for online, red for offline)
7. THE Status_Section SHALL refresh all status indicators (bot, script, website) by fetching from their data source at an interval no longer than 60 seconds without requiring a page reload
8. THE Status_Section SHALL display automatically fetched update logs from a configurable source URL, showing the 10 most recent entries in reverse chronological order
9. IF a status data fetch fails, THEN THE Status_Section SHALL display the last known status with a visual indication that the data may be stale

### Requirement 8: Link Page Landing

**User Story:** As a visitor, I want to check alias availability and understand pricing for the link service, so that I can decide whether to purchase.

#### Acceptance Criteria

1. THE Link_Page SHALL display a chequered animated background
2. THE Link_Page SHALL display an alias textbox that accepts alphanumeric characters and underscores with a minimum length of 3 characters and a maximum length of 20 characters
3. WHEN the user stops typing in the alias textbox for at least 300 milliseconds, THE Link_Page SHALL query alias availability and display the result within 2 seconds as a visible "available" or "unavailable" indicator adjacent to the textbox
4. IF the alias availability check fails due to a network or server error, THEN THE Link_Page SHALL display an error indicator informing the visitor that availability could not be verified
5. THE Link_Page SHALL display a login button for existing users
6. THE Link_Page SHALL display a purchase button showing "$20 lifetime" and "$10 for two months" pricing
7. THE Link_Page SHALL apply Parallax_Effect and Glassmorphism styling to the main card

### Requirement 9: Dashboard Card Editor

**User Story:** As a logged-in user, I want to customise my profile card style, so that my link page looks unique.

#### Acceptance Criteria

1. WHILE the user is logged in, THE Dashboard SHALL display a Card_Editor with the following predefined style options: compact, invisible, full, and horizontal
2. THE Card_Editor SHALL display a live preview of the selected card style, rendered at the same dimensions as the card appears on the user's public link page
3. WHEN the user selects a card style, THE Card_Editor SHALL update the preview within 300 milliseconds using a fade or slide transition animation lasting no longer than 400 milliseconds
4. WHEN the user selects a card style and confirms the selection, THE Card_Editor SHALL persist the chosen style so that the user's public link page reflects the selected card style on subsequent page loads
5. IF the Card_Editor fails to save the selected style, THEN THE Card_Editor SHALL display an error message indicating the save failed and retain the user's previous selection without reverting the preview

### Requirement 10: Dashboard Profile Picture Effects

**User Story:** As a logged-in user, I want to add visual effects to my profile picture, so that my profile stands out.

#### Acceptance Criteria

1. THE Dashboard SHALL display a profile picture effects selection panel listing the following effects: rainbow, shine, glow, pulse, and border
2. WHEN the user toggles an effect on, THE Dashboard SHALL apply that effect to the profile picture and visually indicate the effect as active in the selection panel
3. WHEN the user toggles an active effect off, THE Dashboard SHALL remove that effect from the profile picture and visually indicate the effect as inactive in the selection panel
4. WHILE the user has 2 effects active, THE Dashboard SHALL prevent enabling any additional effect
5. IF the user attempts to enable a third effect while 2 effects are already active, THEN THE Dashboard SHALL display an error message indicating the maximum of 2 active effects has been reached and dismiss the message after 3 seconds

### Requirement 11: Dashboard Display Name and Social Links

**User Story:** As a logged-in user, I want to customise my display name appearance and add social links, so that visitors can find me elsewhere.

#### Acceptance Criteria

1. THE Dashboard SHALL provide display name effects selectable from a list including animated text, gradient colours, and glow effects, with one effect active at a time
2. THE Dashboard SHALL allow adding social links for the following platforms: Discord, TikTok, YouTube, Roblox, and up to 3 custom platform URLs, for a maximum of 8 total social links
3. WHEN the user adds a social link, THE Dashboard SHALL validate that the input begins with "https://" and contains a valid domain format before saving
4. IF the user submits a social link that fails URL validation, THEN THE Dashboard SHALL display an error message indicating the URL is invalid and SHALL NOT save the link
5. THE Dashboard SHALL display social links on the profile card, each accompanied by the corresponding platform icon sized consistently across all links

### Requirement 12: Dashboard Background Customisation

**User Story:** As a logged-in user, I want to set a custom background for my profile card, so that it reflects my personal style.

#### Acceptance Criteria

1. THE Dashboard SHALL support background images in PNG, JPG, and WebP formats with a maximum file size of 5 MB and a maximum resolution of 3840×2160 pixels
2. THE Dashboard SHALL support background GIFs with a maximum file size of 8 MB and a maximum duration of 15 seconds
3. THE Dashboard SHALL support background videos in MP4 format with a maximum file size of 20 MB and a maximum duration of 30 seconds
4. WHEN the user uploads a background, THE Dashboard SHALL display a preview of the background rendered at the profile card dimensions before saving
5. THE Dashboard SHALL allow adjusting background opacity from 0% to 100%, blur from 0 to 20 pixels, and positioning via fit modes (cover, contain, and manual offset with X and Y percentage values from 0% to 100%)
6. IF the user uploads a file that exceeds the allowed size, duration, or resolution limits or is in an unsupported format, THEN THE Dashboard SHALL reject the upload and display an error message indicating the specific validation failure
7. IF a background upload fails due to a network or server error, THEN THE Dashboard SHALL retain the user's previously saved background and display an error message indicating the upload could not be completed

### Requirement 13: Dashboard Roblox Presence

**User Story:** As a logged-in user, I want to show my Roblox presence on my profile card, so that visitors can see what I am playing.

#### Acceptance Criteria

1. THE Dashboard SHALL provide Roblox presence settings with individual toggles for: display current game, show online status, and display avatar
2. WHEN the user enables Roblox presence and provides their Roblox username or user ID, THE Dashboard SHALL fetch and display the user's current Roblox status on the profile card preview within 5 seconds
3. IF the Roblox presence fetch fails due to a network error or invalid user identifier, THEN THE Dashboard SHALL display an error message indicating the presence data could not be retrieved and SHALL NOT display stale data on the profile card

### Requirement 14: Visual Design System

**User Story:** As a visitor, I want a premium visual experience across the entire website, so that the brand feels polished and professional.

#### Acceptance Criteria

1. THE Website SHALL use a colour scheme consisting of black (#000000, #0a0a0a, #111111), white (#ffffff, #f0f0f0), and Valorant_Pink (#FF4655) as the accent colour
2. THE Website SHALL apply Glassmorphism to card elements and modal overlays using backdrop-filter blur of 10px to 20px and background opacity between 10% and 30%
3. THE Website SHALL render a Snowfall_Effect particle animation in the page background with a minimum of 50 and maximum of 150 particles visible at any time
4. THE Website SHALL apply CSS transitions with a duration between 300ms and 500ms to all interactive elements on hover and click
5. THE Website SHALL apply animated gradient backgrounds to section dividers and accent elements using a cycling animation with a period between 3 and 8 seconds
6. THE Website SHALL apply a backdrop blur of 5px to 15px to out-of-focus content during modal or section transitions

### Requirement 15: Responsive Design

**User Story:** As a visitor on any device, I want the website to adapt to my screen size, so that I have a usable experience on mobile, tablet, and desktop.

#### Acceptance Criteria

1. THE Website SHALL adapt layout to viewport widths of 320px (mobile), 768px (tablet), and 1200px+ (desktop)
2. WHILE the viewport width is below 768px, THE Website SHALL stack the hero section vertically with the image above the text
3. WHILE the viewport width is below 768px, THE Website SHALL convert the Features_Section to a single-column layout
4. WHILE the viewport width is below 768px, THE Website SHALL maintain touch-friendly tap targets with a minimum size of 44x44px on all interactive elements
5. WHILE the viewport width is below 768px, THE Website SHALL convert section navigation links to a hamburger menu or scrollable horizontal list
6. THE Website SHALL prevent horizontal overflow on all viewport widths, ensuring no horizontal scrollbar appears

### Requirement 16: Animation and Interaction Effects

**User Story:** As a visitor, I want smooth animations and interactive feedback throughout the site, so that the experience feels polished and engaging.

#### Acceptance Criteria

1. THE Website SHALL apply mouse-parallax depth effects to hero elements with dampened tracking using an easing factor between 0.05 and 0.1, resulting in a maximum element displacement of 20px from its resting position
2. THE Website SHALL animate page sections into view using slide-up animations triggered when the section enters the viewport via an Intersection Observer with a threshold of 0.1
3. THE Website SHALL apply a scale transform between 1.02 and 1.05 and a box-shadow glow using Valorant_Pink at 20% to 40% opacity on hover for clickable cards and buttons
4. THE Website SHALL render particle effects (dots and connecting lines) in the background that increase connecting line opacity when the mouse cursor is within 150px of a particle
5. WHEN a page section becomes visible on scroll, THE Website SHALL trigger a staggered fade-in animation for child elements with a delay of 50ms to 100ms between each child element
