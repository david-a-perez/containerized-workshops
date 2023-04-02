import React from "react";

function getCookie(name : string) {
  let cookieValue = null;

  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();

      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));

        break;
      }
    }
  }

  return cookieValue;
}

const getCsrfToken = () => getCookie("csrftoken");

function CSRFTOKEN({ csrftoken } : {csrftoken: string | null} ) {
  return (
    csrftoken ?  (
      <input name="csrfmiddlewaretoken" value={csrftoken} type="hidden" />
    ) : <></>
  );
}

export { getCsrfToken, CSRFTOKEN };