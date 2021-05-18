$('.navbar-toggler').on('click', function (event) {
    let nav = $(this).attr('data-target');
    $(nav).toggleClass('show');
    $('.main-nav-overlay').toggleClass('show');
});

$('#btn-deposit').on('click', function (event) {
    $('#DepositModal').modal('toggle')
    $('body').toggleClass('modal-active')
});

$('.btn-close').on('click', function (event) {
    $('#DepositModal').modal('toggle')
    $('body').toggleClass('modal-active')
});

$('.btn-close-modal').on('click', function (event) {
    $('#DepositModal').modal('toggle')
    $('body').toggleClass('modal-active')
});