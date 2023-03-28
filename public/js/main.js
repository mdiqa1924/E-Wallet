

statusTexts = document.getElementsByName("status-text")

statusTexts.forEach(statusText => {
    if (statusText.textContent == "waiting") {
        statusText.style.color = 'red';
    }

});

// $(document).ready(function () {
//     $('.status-text').css({ 'color': 'white' });
// });


function viewUser(id) {
    window.location.href = '/users/' + id;
}

function navigateTransactionView(id) {
    window.location.href = '/admin/transaction/' + id;
}

// function formatMoney(n) {
//     return (Math.round(n * 100) / 100).toLocaleString();
// }

function formatMoney() {
    $(document).ready(function () {
        $(".user-money").text(function () {
            console.log(this.textContent);
            return this.textContent.toString().replace(/\B(?!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

        })
    })
}
// function () {
//     let n = parseInt(document.getElementById('user-money'))
//     return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',').text
// }

