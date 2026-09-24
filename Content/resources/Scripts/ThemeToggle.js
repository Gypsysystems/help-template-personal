(function () {
		"use strict";

		var STORAGE_KEY = "synergy-help-theme";
		var THEME_ATTRIBUTE = "data-theme";
		var STYLE_ID = "synergy-darkmode-runtime";


		/*==========================================================================
		STORAGE
		==========================================================================*/

		function getSavedTheme()
		{
			try
			{
				var value = window.localStorage.getItem(STORAGE_KEY);

				if (value === "dark" || value === "light")
				{
					return value;
				}
			}
			catch (e)
			{
				/* Continue without local storage. */
			}

			return null;
		}


		function saveTheme(theme)
		{
			try
			{
				window.localStorage.setItem(STORAGE_KEY, theme);
			}
			catch (e)
			{
				/* Theme still works if storage is unavailable. */
			}
		}


		function getInitialTheme()
		{
			return getSavedTheme() || "light";
		}


		/*==========================================================================
		ACCESSIBLE FLARE DOCUMENTS
		==========================================================================*/

		function getDocuments()
		{
			var docs = [];

			function addDocument(doc)
			{
				if (!doc)
				{
					return;
				}

				for (var i = 0; i < docs.length; i++)
				{
					if (docs[i] === doc)
					{
						return;
					}
				}

				docs.push(doc);
			}

			addDocument(document);

			try
			{
				if (
					window.parent &&
					window.parent.document
					)
				{
					addDocument(
						window.parent.document
						);
				}
			}
			catch (e)
			{
				/* Ignore inaccessible parent document. */
			}

			try
			{
				if (
					window.top &&
					window.top.document
					)
				{
					addDocument(
						window.top.document
						);
				}
			}
			catch (e)
			{
				/* Ignore inaccessible top document. */
			}

			return docs;
		}


		/*==========================================================================
		LOCATE DARKMODE.CSS
		==========================================================================*/

		function getDarkModeCssUrl()
		{
			var scripts =
				document.getElementsByTagName("script");

			for (var i = 0; i < scripts.length; i++)
			{
				var src = scripts[i].src || "";

				if (
					src.indexOf("ThemeToggle.js") !== -1
				)
					{
				return src.replace(
					/Scripts\/ThemeToggle.js(?:\?.*)?$/i,
				"Stylesheets/DarkMode.css"
				);
					}
					}

				return null;
			}


			/*==========================================================================
			LOAD DARKMODE.CSS INTO FLARE'S OUTER SHELL
			==========================================================================*/

			function ensureDarkModeStylesheet(doc)
			{
				if (
					!doc ||
					!doc.head
					)
				{
					return;
				}

				var links =
					doc.getElementsByTagName("link");

				for (var i = 0; i < links.length; i++)
				{
					var href =
						links[i].href || "";

					if (
						href.indexOf("DarkMode.css") !== -1
					)
						{
					return;
				}
			}

			var cssUrl =
				getDarkModeCssUrl();

			if (!cssUrl)
			{
				return;
			}

			var link =
				doc.createElement("link");

			link.id = STYLE_ID;
			link.rel = "stylesheet";
			link.type = "text/css";
			link.href = cssUrl;

			doc.head.appendChild(link);
		}


		/*==========================================================================
		CURRENT THEME
		==========================================================================*/

		function getCurrentTheme()
		{
			var docs =
				getDocuments();

			for (
				var i = docs.length - 1;
				i >= 0;
				i--
				)
			{
				if (!docs[i].documentElement)
				{
					continue;
				}

				var value =
					docs[i].documentElement.getAttribute(
					THEME_ATTRIBUTE
					);

				if (
					value === "dark" ||
					value === "light"
					)
				{
					return value;
				}
			}

			return getInitialTheme();
		}


		/*==========================================================================
		SVG ICONS
		==========================================================================*/

		function getMoonSvg()
		{
			return '' +
				'<svg ' +
				'class="theme-toggle-svg" ' +
				'viewBox="0 0 24 24" ' +
				'aria-hidden="true" ' +
				'focusable="false">' +

				'<path ' +
				'd="' +
				'M20.5 14.3 ' +
				'A8.5 8.5 0 0 1 9.7 3.5 ' +
				'A8.7 8.7 0 1 0 20.5 14.3Z' +
				'">' +
				'</path>' +

				'</svg>';
		}


		function getSunSvg()
		{
			return '' +
				'<svg ' +
				'class="theme-toggle-svg theme-toggle-sun-svg" ' +
				'viewBox="0 0 24 24" ' +
				'aria-hidden="true" ' +
				'focusable="false">' +

				'<circle ' +
				'cx="12" ' +
				'cy="12" ' +
				'r="4">' +
				'</circle>' +

				'<path ' +
				'd="' +
				'M12 2v2 ' +
				'M12 20v2 ' +
				'M4.93 4.93l1.42 1.42 ' +
				'M17.65 17.65l1.42 1.42 ' +
				'M2 12h2 ' +
				'M20 12h2 ' +
				'M4.93 19.07l1.42-1.42 ' +
				'M17.65 6.35l1.42-1.42' +
				'">' +
				'</path>' +

				'</svg>';
		}


		/*==========================================================================
		UPDATE BUTTON
		==========================================================================*/

		function updateButton(button, theme)
		{
			if (!button)
			{
				return;
			}

			var isDark =
				theme === "dark";

			var currentIconTheme =
				button.getAttribute(
				"data-icon-theme"
				);

			if (currentIconTheme !== theme)
				{
			button.innerHTML =
				isDark
				? getSunSvg()
				: getMoonSvg();

			button.setAttribute(
				"data-icon-theme",
				theme
				);
		}

		button.setAttribute(
			"aria-pressed",
			isDark ? "true" : "false"
			);

		button.setAttribute(
			"aria-label",
			isDark
			? "Switch to light theme"
			: "Switch to dark theme"
			);

		button.setAttribute(
			"title",
			isDark
			? "Switch to light theme"
			: "Switch to dark theme"
			);
	}


function updateAllButtons(theme)
{
	var docs =
		getDocuments();

	for (
		var d = 0;
		d < docs.length;
		d++
		)
	{
		var buttons =
			docs[d].querySelectorAll(
			"button.theme-toggle"
			);

		for (
			var i = 0;
			i < buttons.length;
			i++
			)
		{
			updateButton(
				buttons[i],
				theme
				);
		}
	}
}


    /*==========================================================================
      APPLY THEME
    ==========================================================================*/

function applyTheme(theme)
{
	var docs =
		getDocuments();

	for (
		var i = 0;
		i < docs.length;
		i++
		)
	{
		ensureDarkModeStylesheet(
			docs[i]
			);

		if (
			docs[i].documentElement
			)
		{
			docs[i].documentElement.setAttribute(
				THEME_ATTRIBUTE,
				theme
				);
		}

		if (
			docs[i].body
			)
		{
			docs[i].body.setAttribute(
				THEME_ATTRIBUTE,
				theme
				);
		}
	}

	saveTheme(theme);

	updateAllButtons(theme);
}


    /*==========================================================================
      FIND FLARE SEARCH HOST
    ==========================================================================*/

function findSearchHost(doc)
{
	if (!doc)
	{
		return null;
	}

	var wrapper =
		doc.querySelector(
		".nav-search-wrapper"
		);

	if (wrapper)
	{
		return wrapper;
	}

	var searchBar =
		doc.querySelector(
		".search-bar"
		);

	if (
		searchBar &&
		searchBar.parentNode
		)
	{
		return searchBar.parentNode;
	}

	return null;
}


    /*==========================================================================
      CREATE BUTTON
    ==========================================================================*/

function createButton(doc)
{
	var button =
		doc.createElement("button");

	button.type = "button";
	button.className =
		"theme-toggle";

	updateButton(
		button,
		getCurrentTheme()
		);

	return button;
}


    /*==========================================================================
      INSERT BUTTON
    ==========================================================================*/

function insertThemeButton()
{
	var docs =
		getDocuments();

	var host = null;
	var hostDoc = null;

	for (
		var i = docs.length - 1;
		i >= 0;
		i--
		)
	{
		var candidate =
			findSearchHost(
			docs[i]
			);

		if (candidate)
		{
			host = candidate;
			hostDoc = docs[i];

			break;
		}
	}

	if (
		!host ||
		!hostDoc
		)
	{
		return false;
	}

	var existing =
		hostDoc.querySelector(
		"button.theme-toggle"
		);

	if (existing)
	{
		return true;
	}

	for (
		var d = 0;
		d < docs.length;
		d++
		)
	{
		if (
			docs[d] === hostDoc
			)
		{
			continue;
		}

		var oldButtons =
			docs[d].querySelectorAll(
			"button.theme-toggle"
			);

		for (
			var b = 0;
			b < oldButtons.length;
			b++
			)
		{
			if (
				oldButtons[b].parentNode
				)
			{
				oldButtons[b].parentNode.removeChild(
					oldButtons[b]
					);
			}
		}
	}

	if (
		host.classList &&
		!host.classList.contains(
		"theme-toggle-host"
		)
		)
	{
		host.classList.add(
			"theme-toggle-host"
			);
	}

	host.appendChild(
		createButton(hostDoc)
		);

	return true;
}


    /*==========================================================================
      THEME BUTTON CLICK HANDLER
    ==========================================================================*/

function handleClick(event)
{
	var target =
		event.target;

	while (
		target &&
		target.nodeType === 1
		)
	{
		if (
			target.classList &&
			target.classList.contains(
			"theme-toggle"
			)
			)
		{
			event.preventDefault();
			event.stopPropagation();

			var current =
				getCurrentTheme();

			var next =
				current === "dark"
				? "light"
				: "dark";

			applyTheme(next);

			return;
		}

		target =
			target.parentNode;
	}
}


function attachClickHandler(doc)
{
	if (
		!doc ||
		!doc.documentElement
		)
	{
		return;
	}

	if (
		doc.documentElement.getAttribute(
		"data-synergy-theme-handler"
		) === "true"
		)
	{
		return;
	}

	doc.addEventListener(
		"click",
		handleClick,
		true
		);

	doc.documentElement.setAttribute(
		"data-synergy-theme-handler",
		"true"
		);
}


    /*==========================================================================
      DARK TOPIC TRANSITION PROTECTION

      When Flare switches topics, the previous topic can disappear before the
      next topic finishes applying its dark styling.

      This creates a brief white flash.

      We activate a temporary dark overlay before navigation begins.
    ==========================================================================*/

function startDarkTopicTransition()
{
	if (
		getCurrentTheme() !== "dark"
	)
		{
	return;
}

var docs =
	getDocuments();

for (
	var i = 0;
	i < docs.length;
	i++
	)
{
	if (
		docs[i].documentElement
		)
	{
		docs[i].documentElement.classList.add(
			"theme-topic-loading"
			);
	}
}

        /*
          Safety fallback in case Flare does not fire a frame-load
          event that we can observe.
        */

window.setTimeout(
	stopDarkTopicTransition,
	550
	);
}


function stopDarkTopicTransition()
{
	var docs =
		getDocuments();

	for (
		var i = 0;
		i < docs.length;
		i++
		)
	{
		if (
			docs[i].documentElement
			)
		{
			docs[i].documentElement.classList.remove(
				"theme-topic-loading"
				);
		}
	}
}


    /*==========================================================================
      DETECT SIDE NAVIGATION CLICKS
    ==========================================================================*/

function isNavigationClick(target)
{
	var element =
		target;

	while (
		element &&
		element.nodeType === 1
		)
	{
		if (
			element.tagName &&
			element.tagName.toLowerCase() === "a"
			)
		{
			var parent =
				element.parentNode;

			while (
				parent &&
				parent.nodeType === 1
				)
			{
				if (
					parent.classList &&
					(
					parent.classList.contains(
					"sidenav-wrapper"
					) ||
					parent.classList.contains(
					"sidenav-container"
					) ||
					parent.classList.contains(
					"sidenav"
					) ||
					parent.classList.contains(
					"tree"
					)
					)
					)
				{
					return true;
				}

				parent =
					parent.parentNode;
			}
		}

		element =
			element.parentNode;
	}

	return false;
}


function handleNavigationTransition(event)
{
	if (
		getCurrentTheme() === "dark" &&
		isNavigationClick(
		event.target
		)
		)
	{
		startDarkTopicTransition();
	}
}


    /*==========================================================================
      ATTACH NAVIGATION FLASH PROTECTION
    ==========================================================================*/

function attachNavigationProtection(doc)
{
	if (
		!doc ||
		!doc.documentElement
		)
	{
		return;
	}

	if (
		doc.documentElement.getAttribute(
		"data-synergy-navigation-protection"
		) === "true"
		)
	{
		return;
	}

	/*
	Capture phase lets this execute before Flare handles the link click.
	*/

	doc.addEventListener(
		"click",
		handleNavigationTransition,
		true
		);


	/*
	Stop the transition when an existing iframe completes loading.
	*/

	var frames =
		doc.getElementsByTagName(
		"iframe"
		);

	for (
		var i = 0;
		i < frames.length;
		i++
		)
	{
		if (
			frames[i].getAttribute(
			"data-synergy-theme-frame"
			) === "true"
			)
		{
			continue;
		}

		frames[i].addEventListener(
			"load",
			stopDarkTopicTransition
			);

		frames[i].setAttribute(
			"data-synergy-theme-frame",
			"true"
			);
	}

	doc.documentElement.setAttribute(
		"data-synergy-navigation-protection",
		"true"
		);
}


    /*==========================================================================
      WATCH FLARE DOM

      Only restore the theme button when Flare actually removes it.
    ==========================================================================*/

function watchDocument(doc)
{
	if (
		!doc ||
		!doc.documentElement ||
		!window.MutationObserver
		)
	{
		return;
	}

	if (
		doc.documentElement.getAttribute(
		"data-synergy-theme-observer"
		) === "true"
		)
	{
		return;
	}

	var timer = null;

	var observer =
		new MutationObserver(
		function ()
		{
			clearTimeout(timer);

			timer =
				setTimeout(
				function ()
				{
					/*
					Flare may add new frames during navigation.
					Register those frames for load events.
					*/

					attachNavigationProtection(
						doc
						);

					var docs =
						getDocuments();

					var buttonExists =
						false;

					for (
						var i = 0;
						i < docs.length;
						i++
						)
					{
						if (
							docs[i].querySelector(
							"button.theme-toggle"
							)
							)
						{
							buttonExists =
								true;

							break;
						}
					}

					if (buttonExists)
					{
						return;
					}

					insertThemeButton();

					updateAllButtons(
						getCurrentTheme()
						);
				},
				150
				);
		}
		);

	observer.observe(
		doc.documentElement,
		{
		childList: true,
		subtree: true
		}
		);

	doc.documentElement.setAttribute(
		"data-synergy-theme-observer",
		"true"
		);
}


    /*==========================================================================
      INITIALIZE
    ==========================================================================*/

function initialize()
{
	var docs =
		getDocuments();

	var theme =
		getInitialTheme();

	for (
		var i = 0;
		i < docs.length;
		i++
		)
	{
		ensureDarkModeStylesheet(
			docs[i]
			);

		attachClickHandler(
			docs[i]
			);

		attachNavigationProtection(
			docs[i]
			);

		watchDocument(
			docs[i]
			);
	}

	applyTheme(theme);

	insertThemeButton();


	/*
	MadCap can finish generating parts of the shell after DOMContentLoaded.
	*/

	window.setTimeout(
		function ()
		{
			insertThemeButton();

			var currentDocs =
				getDocuments();

			for (
				var i = 0;
				i < currentDocs.length;
				i++
				)
			{
				attachNavigationProtection(
					currentDocs[i]
					);
			}
		},
		250
		);


	window.setTimeout(
		function ()
		{
			insertThemeButton();

			var currentDocs =
				getDocuments();

			for (
				var i = 0;
				i < currentDocs.length;
				i++
				)
			{
				attachNavigationProtection(
					currentDocs[i]
					);
			}
		},
		750
		);


	window.setTimeout(
		function ()
		{
			insertThemeButton();

			var currentDocs =
				getDocuments();

			for (
				var i = 0;
				i < currentDocs.length;
				i++
				)
			{
				attachNavigationProtection(
					currentDocs[i]
					);
			}
		},
		1500
		);
}


    /*==========================================================================
      START
    ==========================================================================*/

if (
	document.readyState === "loading"
	)
{
	document.addEventListener(
		"DOMContentLoaded",
		initialize
		);
}
else
{
	initialize();
}

})();