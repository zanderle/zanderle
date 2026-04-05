$(document).ready(function () {
    $('[role="tab"]').on('click', function (e) {
        e.preventDefault();
        var target = $(this).attr('href');
        $('[role="tab"]').attr('aria-selected', 'false');
        $('[role="tabpanel"]').attr('aria-expanded', 'false');
        $('[href="' + target + '"][role="tab"]').attr('aria-selected', 'true');
        target = target.replace('#', '.')
        $(target + '[role="tabpanel"]').attr('aria-expanded', 'true');
    })
});