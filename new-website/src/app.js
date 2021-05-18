$('.navbar-toggler').on('click', function (event) {
    let nav = $(this).attr('data-target');
    $(nav).toggleClass('show');
    $('.main-nav-overlay').toggleClass('show');
});

$('#btn-stake').on('click', function (event) {
    $('#StakingModal').modal('toggle')
    $('body').toggleClass('modal-active')
});

$('#btn-unstake').on('click', function (event) {
    $('#UnStakingModal').modal('toggle')
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