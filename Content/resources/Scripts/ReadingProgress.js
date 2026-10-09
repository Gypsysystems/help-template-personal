/* Presight - topic reading progress.
   Draws a thin accent line pinned to the bottom edge of the header (or the
   top of the viewport when the header scrolls away) and fills it as the
   reader moves through the topic.

   Two things make this survive Flare's output rather than guessing at it:
   - the scroll container is DETECTED, not assumed. Depending on the skin and
     the breakpoint, Flare scrolls the window, .body-container or
     .off-canvas-content; the wrong listener means a bar that never moves.
   - the header's height is MEASURED each frame instead of hard-coded, so the
     line stays on the header's edge across breakpoints and logo sizes.

   Load it from the master page, after the theme script. */

(function () {
	"use strict";

	var HEADER_SELECTORS = [".title-bar-container", ".title-bar", ".navigation-wrapper"];
	var SCROLLER_SELECTORS = [".body-container", "#contentBody", ".off-canvas-content",
		".off-canvas-wrapper-inner", ".main-section", "#content-section"];

	var track, bar, scroller, ticking = false;

	function root() {
		return document.scrollingElement || document.documentElement;
	}

	function isRoot(el) {
		return el === root() || el === document.documentElement || el === document.body;
	}

	function findScroller() {
		var r = root();
		if (r.scrollHeight - r.clientHeight > 24) { return r; }

		for (var i = 0; i < SCROLLER_SELECTORS.length; i++) {
			var el = document.querySelector(SCROLLER_SELECTORS[i]);
			if (el && el.scrollHeight - el.clientHeight > 24) { return el; }
		}
		return r;
	}

	/* Pin under the header only when the header is actually fixed at the top of
	   the viewport. If it scrolls with the page, the line belongs at top: 0. */
		function headerOffset() {
			for (var i = 0; i < HEADER_SELECTORS.length; i++) {
				var h = document.querySelector(HEADER_SELECTORS[i]);
				if (!h) { continue; }

				var bottom = h.getBoundingClientRect().bottom;
				if (bottom > 240) { return 240; }
				if (bottom > 0) { return bottom; }
				return 0;
			}
			return 0;
		}

	function scrollTopOf(el) {
		return isRoot(el) ? (window.pageYOffset || root().scrollTop || 0) : el.scrollTop;
	}

	function update() {
		ticking = false;
		if (!track) { return; }

		var max = scroller.scrollHeight - scroller.clientHeight;
		var pct = max > 8 ? (scrollTopOf(scroller) / max) * 100 : 0;

		if (pct < 0) { pct = 0; }
		if (pct > 100) { pct = 100; }

		bar.style.width = pct.toFixed(2) + "%";
		track.style.top = headerOffset() + "px";
		track.style.opacity = max > 8 ? "1" : "0";
	}

	function request() {
		if (ticking) { return; }
		ticking = true;
		window.requestAnimationFrame(update);
	}

	function listen(el) {
		(isRoot(el) ? window : el).addEventListener("scroll", request, { passive: true });
	}

	function unlisten(el) {
		(isRoot(el) ? window : el).removeEventListener("scroll", request);
	}

	/* Content height changes as images and iframes finish loading, and the
	   scrolling element itself can change at a breakpoint. Re-check on both. */
	function recheck() {
		var next = findScroller();
		if (next !== scroller) {
			unlisten(scroller);
			scroller = next;
			listen(scroller);
		}
		request();
	}

	function init() {
		if (!document.body) { return; }
		if (document.documentElement.className.indexOf("home-page") > -1) { return; }
		if (document.querySelector(".reading-progress")) { return; }

		track = document.createElement("div");
		track.className = "reading-progress";
		track.setAttribute("aria-hidden", "true");

		bar = document.createElement("span");
		track.appendChild(bar);
		document.body.appendChild(track);

		scroller = findScroller();
		listen(scroller);

		window.addEventListener("resize", recheck);
		window.addEventListener("load", recheck);
		window.setTimeout(recheck, 400);
		window.setTimeout(recheck, 1200);

		update();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
})();