from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('clients', '0002_interaction'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200)),
                ('category', models.CharField(choices=[('devis', 'Devis'), ('relance', 'Relance'), ('facture', 'Facture'), ('merci', 'Remerciement'), ('autre', 'Autre')], default='autre', max_length=20)),
                ('subject', models.CharField(max_length=500)),
                ('body', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='email_templates', to='auth.user')),
            ],
            options={
                'ordering': ['category', 'name'],
            },
        ),
        migrations.CreateModel(
            name='SentEmail',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('to_email', models.EmailField()),
                ('subject', models.CharField(max_length=500)),
                ('body', models.TextField()),
                ('status', models.CharField(choices=[('sent', 'Envoyé'), ('failed', 'Échec')], default='sent', max_length=10)),
                ('error_msg', models.TextField(blank=True)),
                ('sent_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='emails', to='clients.client')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sent_emails', to='auth.user')),
                ('template', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='emails.emailtemplate')),
            ],
            options={
                'ordering': ['-sent_at'],
            },
        ),
    ]
