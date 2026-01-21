import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Platform settings (singleton table for platform-wide configuration)
  await knex.schema.createTable('platform_settings', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    // Default Payment Provider Configuration
    table.string('default_payment_provider', 50); // paystack, stripe, flutterwave, piggyvest-business
    table.text('default_payment_credentials'); // Encrypted JSON
    table.jsonb('default_payment_settings').defaultTo('{}');

    // Default Email Provider Configuration
    table.string('default_email_provider', 50); // sendgrid, smtp
    table.text('default_email_credentials'); // Encrypted JSON
    table.jsonb('default_email_settings').defaultTo('{}');

    // Default SMS Provider Configuration
    table.string('default_sms_provider', 50); // twilio, termii
    table.text('default_sms_credentials'); // Encrypted JSON
    table.jsonb('default_sms_settings').defaultTo('{}');

    // Platform branding defaults
    table.jsonb('default_branding').defaultTo('{}');

    // Platform contact info
    table.string('support_email', 255);
    table.string('support_phone', 50);

    // Timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Insert singleton row with default values
  await knex('platform_settings').insert({
    default_branding: JSON.stringify({
      defaultPrimaryColor: '#3B82F6',
      defaultSecondaryColor: '#10B981',
    }),
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('platform_settings');
}
