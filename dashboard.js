const cookieData = {};

document.addEventListener("DOMContentLoaded", function () {
  const navButtonLoggedIn = document.getElementById("logged-in");
  const navButtonLoggedOut = document.getElementById("logged-out");

  const cookiesToFetch = ["name", "email", "intercomHastag"];

  cookiesToFetch.forEach((cookieName) => {
    cookieData[cookieName] = getCookie(cookieName);
  });

  if (isUserLoggedIn(cookieData)) {
    handleUserLoggedIn(cookieData);
  }

  function handleUserLoggedIn(cookieData) {
    hideElement(navButtonLoggedOut);
    showElement(navButtonLoggedIn);
  }
});

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
}

function isUserLoggedIn(cookieData) {
  return !!cookieData.name && !!cookieData.email;
}

function hideElement(element) {
  element.style.display = "none";
}

function showElement(element, displayValue = "block") {
  element.style.display = displayValue;
}

function watchForIntercom(callback) {
  const observer = new MutationObserver((mutations, obs) => {
    for (let mutation of mutations) {
      if (mutation.addedNodes.length) {
        for (let node of mutation.addedNodes) {
          if (node.id && node.id.startsWith("intercom-")) {
            callback(); // Intercom added its elements to the DOM
            obs.disconnect(); // Stop observing once Intercom is detected
            return;
          }
        }
      }
    }
  });
  observer.observe(document, { childList: true, subtree: true });
}

watchForIntercom(() => {
  if (Intercom.booted) {
    if (isUserLoggedIn(cookieData)) {
      Intercom("update", {
        name: getCookie("name"),
        email: getCookie("email"),
        user_hash: getCookie("intercomHastag")
      });
    }
  }
});
