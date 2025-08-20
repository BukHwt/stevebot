# Changelog

All notable changes to the SteveBot widget project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-08-20

### Changed
- **Improved widget visibility on honolulu blue backgrounds**
  - Changed button background from blue to white with blue border for better contrast
  - Increased button size from 48px to 56px for better mobile visibility
  - Enhanced shadow effects with multiple layers and white outline glow
  - Added hover animations for better user interaction feedback

- **Enhanced text readability across all widget components**
  - Fixed bot message bubble text contrast with darker text color and light background
  - Improved input field text visibility with explicit dark text color
  - Added `!important` declarations to override external styling conflicts
  - Updated typing indicator colors to ensure animated ellipses are visible

### Technical Details
- Button now uses white background (`#ffffff`) with dark text (`#333333`)
- Bot message bubbles use light gray background (`#f8f9fa`) with dark text (`#212529`)
- Input field styled with light gray background and rounded corners
- All text elements use forced color declarations to prevent external CSS conflicts

## [1.0.0] - 2025-08-20

### Added
- Initial SteveBot widget implementation
- Interactive chat interface with typing indicators
- Integration with SteveBot API for portfolio questions
- Mobile-responsive design
- Click-outside-to-close functionality
- Real-time message timestamps

### Features
- Fixed position chat button in bottom-left corner
- Expandable chat window with message history
- Animated typing indicator during bot responses
- User and bot message bubbles with distinct styling
- Send button and Enter key support for message submission