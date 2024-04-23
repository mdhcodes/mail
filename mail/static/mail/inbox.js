document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Send email
  // When the 'SubmitQuery' Button is clicked...
  // const submit_btn = document.addEventListener('input', () => {}) // Did not test the 'input' event listener.
  // https://stackoverflow.com/questions/20840128/how-can-i-select-a-button-with-a-type-of-submit-using-javascript
  const submit_btn = document.querySelector('input[type="submit"]');

  // Getting the following error in Firefox: TypeError: NetworkError when attempting to fetch resource.
  // With Chrome, I received the above error but the data did post to the database.
  // To correct the error in Firefox and Chrome, I had to prevent the default form submission.
  // https://stackoverflow.com/questions/59176488/networkerror-when-attempting-to-fetch-resource-only-on-firefox
  // https://stackoverflow.com/questions/30473581/when-to-use-preventdefault-vs-return-false 
  submit_btn.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent form submission

    email_recipients = document.querySelector('#compose-recipients').value;
    email_subject = document.querySelector('#compose-subject').value;
    email_body = document.querySelector('#compose-body').value;

    // Send a POST request to the /emails route with the values captured above. 
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: email_recipients,
        subject: email_subject,
        body: email_body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log('Result:', result);
      // Once the email has been sent, load the user’s sent mailbox.
      load_mailbox('sent')
    })
    .catch((error) => {
      console.log("Error:", error)
    });
  })  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}