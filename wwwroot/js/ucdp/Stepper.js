$(function () {
    const $navLinks = $('div.setup-panel div a');
    const $allSteps = $('.setup-content');

    $allSteps.hide();

    function showStep(targetSelector) {
        const $target = $(targetSelector);
        const $link = $navLinks.filter(`[href="${targetSelector}"]`);

        if (!$target.length || !$link.length) return;
        if ($link.is('[disabled]') || $link.hasClass('disabled')) return;

        $navLinks.removeClass('active-step');
        $link.addClass('active-step');

        $allSteps.hide();
        $target.show();

        const $firstField = $target
            .find('input, select, textarea')
            .filter(':visible:not([type=hidden]):not([disabled])')
            .first();

        if ($firstField.length) {
            $firstField.trigger('focus');
        }
    }

    window.showStep = showStep;

    window.goToNextStep = function (currentStepId) {
        const $currentLink = $(`div.setup-panel div a[href="#${currentStepId}"]`);
        const $nextLink = $currentLink.parent().nextAll()
            .filter(function () {
                return $(this).css('display') === 'block';
            })
            .first()
            .children('a');

        if ($nextLink.length) {
            $nextLink.removeAttr('disabled').removeClass('disabled');
            showStep($nextLink.attr('href'));
        }
    };

    window.goToPreviousStep = function (currentStepId) {
        const $currentLink = $(`div.setup-panel div a[href="#${currentStepId}"]`);
        const $prevLink = $currentLink.parent().prevAll()
            .filter(function () {
                return $(this).css('display') === 'block';
            })
            .first()
            .children('a');

        if ($prevLink.length) {
            showStep($prevLink.attr('href'));
        }
    };

    $navLinks.off('click.stepper').on('click.stepper', function (e) {
        e.preventDefault();
        showStep($(this).attr('href'));
    });

    const $firstStep = $('div.setup-panel div a[href="#step-1"]'); $(function () {
        const $navLinks = $('div.setup-panel div a');
        const $allSteps = $('.setup-content');

        $allSteps.hide();

        function showStep(targetSelector) {
            const $target = $(targetSelector);
            const $link = $navLinks.filter(`[href="${targetSelector}"]`);

            if (!$target.length || !$link.length) return;
            if ($link.is('[disabled]') || $link.hasClass('disabled')) return;

            $navLinks.removeClass('active-step');
            $link.addClass('active-step');

            $allSteps.hide();
            $target.show();

            const $firstField = $target
                .find('input, select, textarea')
                .filter(':visible:not([type=hidden]):not([disabled])')
                .first();

            if ($firstField.length) {
                $firstField.trigger('focus');
            }
        }

        window.showStep = showStep;

        window.goToNextStep = function (currentStepId) {
            const $currentLink = $(`div.setup-panel div a[href="#${currentStepId}"]`);
            const $nextLink = $currentLink.parent().nextAll()
                .filter(function () {
                    return $(this).css('display') === 'block';
                })
                .first()
                .children('a');

            if ($nextLink.length) {
                $nextLink.removeAttr('disabled').removeClass('disabled');
                showStep($nextLink.attr('href'));
            }
        };

        window.goToPreviousStep = function (currentStepId) {
            const $currentLink = $(`div.setup-panel div a[href="#${currentStepId}"]`);
            const $prevLink = $currentLink.parent().prevAll()
                .filter(function () {
                    return $(this).css('display') === 'block';
                })
                .first()
                .children('a');

            if ($prevLink.length) {
                showStep($prevLink.attr('href'));
            }
        };

        $navLinks.off('click.stepper').on('click.stepper', function (e) {
            e.preventDefault();
            showStep($(this).attr('href'));
        });

        const $firstStep = $('div.setup-panel div a[href="#ApplicantDetailsTab"]');
        if ($firstStep.length) {
            $firstStep.removeAttr('disabled').removeClass('disabled');
            showStep('#ApplicantDetailsTab');
        }
    });
    if ($firstStep.length) {
        $firstStep.removeAttr('disabled').removeClass('disabled');
        showStep('#step-1');
    }
});
function appendSharedHiddenFields(formData) {
    const $shared = $("#sharedHiddenFields");
    formData.set("UserId", $shared.find("#UserId").val() || "");
    formData.set("Id", $shared.find("#Id").val() || "");
    formData.set("FundingCallDetailsId", $shared.find("#FundingCallDetailsId").val() || "");
    formData.set("ApplicantCategory", $shared.find("#ApplicantCategory").val() || "");
    formData.set("AppointmentCategory", $shared.find("#AppointmentCategory").val() || "");
}