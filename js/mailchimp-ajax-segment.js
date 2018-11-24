<script type="text/javascript">
    $(document).ready(function(){
        ajaxMailChimpForm($("#subscribe-form"), $("#subscribe-result"));
        // Turn the given MailChimp form into an ajax version of it.
        function ajaxMailChimpForm($form, $resultElement){
            // Hijack the submission. We'll submit the form manually.
            $form.submit(function(e) {
                e.preventDefault();
                if (!isValidEmail($form)) {
                    var error = "A valid email address must be provided.";
                    $resultElement.html(error);
                    $resultElement.css("color", "red");
                } else {
                    $resultElement.css("color", "black");
                    $resultElement.html("Subscribing...");
                    submitSubscribeForm($form, $resultElement);
                }
            });
        }
        // Validate the email address in the form.
        function isValidEmail($form) {
            // If email is empty, show error message.
            // contains just one @
            var email = $form.find("input[type='email']").val();
            if (!email || !email.length) {
                return false;
            } else if (email.indexOf("@") === -1) {
                return false;
            }
            return true;
        }
        // Submit the form with an ajax/jsonp request.
        // Based on http://stackoverflow.com/a/15120409/215821
        function submitSubscribeForm($form, $resultElement) {
            $.ajax({
                type: "GET",
                url: $form.attr("action"),
                data: $form.serialize(),
                cache: false,
                dataType: "jsonp",
                jsonp: "c", // Trigger MailChimp to return a JSONP response.
                contentType: "application/json; charset=utf-8",
                error: function(error){
                    // According to jquery docs, this is never called for cross-domain JSONP requests.
                },
                success: function(data){
                    if (data.result !== "success") {
                        var message = data.msg || "Sorry. Unable to subscribe. Please try again later.";
                        $resultElement.css("color", "red");
                        if (data.msg && data.msg.indexOf("already subscribed") >= 0) {
                            message = "You're already subscribed. Thank you.";
                            $resultElement.css("color", "black");
                            callSegment();
                        }
                        $resultElement.html(message);
                    } else {
                        $resultElement.css("color", "black");
                        $resultElement.html("Thank you!<br>You must confirm the subscription in your inbox.");
                        callSegment();
                    }
                }
            });
        }
    });
    // Run the submission data through Segment.
    function callSegment() {
        var bot = document.getElementById('bot-field').value;
        if(bot.length>0) {
            // If a bot it submitting the form, stop now.
            return false;
        } else {                           
            // Get userId from Segment cookie if it exists. If it doesn't, generate a UUID.
            var segmentId = analytics.user().id();
            var anonymousId = analytics.user().anonymousId();
            if (segmentId === null) {
                var userid = anonymousId;
            } else {
                var userid = segmentId;
            }
            var email = document.getElementById('mce-EMAIL').value;
            var firstname = document.getElementById('mce-FNAME').value;
            var lastname = document.getElementById('mce-LNAME').value;
            // Make the calls
            analytics.identify(userid, {
              firstname: firstname,
              lastname: lastname,
              email: email
            });
            analytics.track('Subscribed', {
              source: 'Mailchimp Form'
            });
            return false;
        }
    };
</script>