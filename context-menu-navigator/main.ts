import { Plugin } from "obsidian";

export default class ContextMenuNavigatorPlugin extends Plugin {
  keydownHandler = (event: KeyboardEvent) => {
    // --- Configuration: Verify menu selector if needed ---
    // This selector tries to find a *visible* menu element. ':not([style*="display: none"])' helps.
    // Inspect with Dev Tools (Ctrl+Shift+I) to confirm '.menu' is the correct class for the main container.
    const menuSelector = 'body > div.menu:not([style*="display: none"])';
    // --- End Configuration ---

    const activeMenu = document.querySelector(
      menuSelector,
    ) as HTMLElement | null;

    // Only proceed if a menu is visible (found matching the selector)
    if (!activeMenu) {
      return; // No menu, do nothing.
    }

    // --- Handle Navigation: Ctrl+P / Ctrl+N ---
    // Check for Ctrl ONLY (no other modifiers) + P or N key
    if (
      event.ctrlKey &&
      !event.altKey &&
      !event.shiftKey &&
      !event.metaKey &&
      (event.key.toLowerCase() === "p" || event.key.toLowerCase() === "n")
    ) {
      console.log(
        `ContextMenuNavigator: Intercepted Ctrl+${event.key}, simulating arrow key.`,
      );

      // *** Crucial: Prevent the default Ctrl+P (Print) / Ctrl+N (New note/window) action ***
      event.preventDefault();
      // Stop the original Ctrl+P/N event from potentially triggering other handlers
      event.stopPropagation();

      // Determine which arrow key to simulate
      const arrowKey =
        event.key.toLowerCase() === "p" ? "ArrowUp" : "ArrowDown";

      // Create the keyboard event to simulate the arrow press
      // We set ctrlKey etc. to false because we want to simulate a plain arrow key press
      const arrowEvent = new KeyboardEvent("keydown", {
        key: arrowKey,
        code: arrowKey, // 'code' often matters for handlers too
        bubbles: true, // Allow event to bubble up the DOM tree
        cancelable: true, // Allow event's default action (if any) to be prevented by handlers
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      });

      // *** Dispatch the simulated event ***
      // The most likely target for the event handler is the menu element itself.
      // If this doesn't work, Obsidian's handler might be on document.body or document.activeElement.
      console.log(
        `ContextMenuNavigator: Dispatching ${arrowKey} event on target:`,
        activeMenu,
      );
      activeMenu.dispatchEvent(arrowEvent);

      // That's it! No need to manually track selection or simulate clicks.
      // Obsidian's native menu handler should receive the simulated ArrowUp/Down
      // and update the selection accordingly. Pressing Enter later should then work natively.
    }
    // No 'else if' for Enter or Space is needed anymore.
  };

  async onload() {
    console.log("Loading Context Menu Navigator plugin");
    // Using capture: true is likely still good here to catch Ctrl+P/N
    // before Obsidian's default handlers for those combinations fire.
    this.registerDomEvent(document, "keydown", this.keydownHandler, {
      capture: true,
    });
  }

  onunload() {
    console.log("Unloading Context Menu Navigator plugin");
    // Listeners registered with registerDomEvent are cleaned up automatically.
  }
}
