"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

const yup = require("yup");

const {
  emailSchema,
  getEmailTemplate,
  requiredStringSchema,
} = require("../../../lib/util");

const messageGroupSchema = yup.object({
  email: emailSchema,
  experience: requiredStringSchema,
  interest: requiredStringSchema,
  name: requiredStringSchema,
});

module.exports = {
  async message(groupId, params) {
    const group = await strapi.services.group.findOne({ id: groupId });
    if (!group) {
      throw Error(`Group not found`);
    }
    const groupOwnerEmail = group.owner?.email;

    emailSchema.validateSync(groupOwnerEmail);
    messageGroupSchema.validateSync(params);

    await strapi.plugins["email"].services.email.sendTemplatedEmail(
      {
        from: strapi.config.get("plugins.email.settings.defaultFrom"),
        fromName: strapi.config.get("plugins.email.settings.defaultFromName"),
        replyTo: `"${params.name}" <${params.email}>`,
        to: groupOwnerEmail,
      },
      {
        subject: "[Pujas.live] Join request from ${name}",
        text: await getEmailTemplate("group-message.txt"),
        html: await getEmailTemplate("group-message.html"),
      },
      {
        ...params,
        frontendUrl: strapi.config.get("server.frontendUrl"),
        groupId,
      }
    );
  },
};
