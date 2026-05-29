# Core AI Modal Interaction Fix

## Changed file
- `src/components/CoreAI/CoreAIModal.tsx`

## Changes made
1. Restored smooth open/close animation using:
   - `origin-top-right`
   - opacity transition
   - subtle `translate-x-3` to `translate-x-0`
   - subtle `scale-[0.97]` to `scale-100`
   - `cubic-bezier(0.32,0.72,0,1)` easing

2. Changed expanded modal behavior:
   - Expanded modal is now anchored to the right side.
   - It expands from right to left instead of jumping to the center.
   - Expanded width is `min(1000px, calc(100vw - 40px))`.
   - Normal width remains `450px`.

3. Centered inner chat content in expanded mode:
   - Chat content remains `max-width: 500px`.
   - It sits centered inside the expanded 1000px modal.

4. Added reduced motion support with `motion-reduce:transition-none`.

## Note
This build focuses only on the Core AI floating modal animation and expanded layout behavior.
