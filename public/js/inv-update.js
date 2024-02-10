const form = document.querySelector("#update")
    form.addEventListener("change", function () {
      const updateBtn = document.querySelector("#submit-button")
      updateBtn.removeAttribute("disabled")
    })