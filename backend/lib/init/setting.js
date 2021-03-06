const bootstrap = require("../bootstrap");

const emailConfirmationMessage = `<p>Thank you for registering!</p>

<p>You have to confirm your email address. Please click on the link below.</p>

<p><a href="<%- URL %>?confirmation=<%- CODE %>">Confirm Email</a></p>

<p>Thanks.</p>`;

const resetPasswordMessage = `<p>We heard that you lost your password. Sorry about that!</p>

<p>But don’t worry! You can use the following link to reset your password:</p>

<p><a href="<%- URL %>?code=<%- TOKEN %>">Reset Password</a></p>

<p>Thanks.</p>`;

const initSettings = async () => {
  strapi.log.info("Initializing settings:");

  const pluginStore = await strapi.store({
    environment: "",
    type: "plugin",
    name: "users-permissions",
  });

  const frontendUrl = strapi.config.get("server.frontendUrl");
  const resetPasswordUrl = `${frontendUrl}/auth/reset-password`;

  await pluginStore.set({
    key: "advanced",
    value: {
      unique_email: true,
      allow_register: true,
      email_confirmation: false,
      email_reset_password: resetPasswordUrl,
      email_confirmation_redirection: null,
      default_role: "authenticated",
    },
  });
  strapi.log.info("  plugin:users-permissions:advanced");

  const defaultFrom = strapi.config.get("plugins.email.settings.defaultFrom");
  const from = { email: defaultFrom.address, name: defaultFrom.name };
  const siteName = strapi.config.get("server.siteName");

  await pluginStore.set({
    key: "email",
    value: {
      email_confirmation: {
        display: "Email.template.email_confirmation",
        icon: "check-square",
        options: {
          from,
          message: emailConfirmationMessage,
          object: `[${siteName}] Confirm your email`,
          response_email: null,
        },
      },
      reset_password: {
        display: "Email.template.reset_password",
        icon: "sync",
        options: {
          from,
          message: resetPasswordMessage,
          object: `[${siteName}] Reset password`,
          response_email: null,
        },
      },
    },
  });
  strapi.log.info("  plugin:users-permissions:email");
};

module.exports = { initSettings };

if (require.main === module) {
  bootstrap(initSettings);
}
