SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.7 (Ubuntu 15.7-1.pgdg20.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', '72848ed3-859c-4e55-b468-d458694aecfb', '{"action":"user_signedup","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-04 14:28:11.272002+00', ''),
	('00000000-0000-0000-0000-000000000000', '0ff039a4-0d8c-4d4a-b1e1-8d41e50c912e', '{"action":"login","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-04 14:28:11.310611+00', ''),
	('00000000-0000-0000-0000-000000000000', '6f46566c-bf35-486c-b89d-1d58bb9d1387', '{"action":"user_recovery_requested","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"user"}', '2025-07-04 14:28:11.67002+00', ''),
	('00000000-0000-0000-0000-000000000000', '5ee684e7-b6d7-41d8-a5f9-2dbe4a30d8a9', '{"action":"login","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-04 14:28:26.016838+00', ''),
	('00000000-0000-0000-0000-000000000000', '1d1b2e13-91e3-4580-8b69-8cd8199f4162', '{"action":"user_signedup","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-04 14:54:05.91448+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b63de2cc-2501-47a2-a378-91881ae509fb', '{"action":"login","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-04 14:54:05.979621+00', ''),
	('00000000-0000-0000-0000-000000000000', '32f34676-4588-4c40-a943-9043d2288990', '{"action":"user_recovery_requested","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"user"}', '2025-07-04 14:54:06.140593+00', ''),
	('00000000-0000-0000-0000-000000000000', '77f2555b-6509-4476-882a-2d096fb8188b', '{"action":"login","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"account"}', '2025-07-04 14:54:59.315413+00', ''),
	('00000000-0000-0000-0000-000000000000', '94096df4-e2a8-42c3-a7fb-215e78f16d9a', '{"action":"token_refreshed","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 15:27:46.25245+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b01c8108-47ba-4d47-a8ad-dc35c20fc782', '{"action":"token_revoked","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 15:27:46.275763+00', ''),
	('00000000-0000-0000-0000-000000000000', '67506093-f7f1-4a95-bc1f-7e635b652a9f', '{"action":"user_signedup","actor_id":"ca95ecfa-129b-48fc-8f85-492d7c8229b9","actor_username":"abc@google.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-07-04 15:36:58.958866+00', ''),
	('00000000-0000-0000-0000-000000000000', '7270813d-beca-43ed-aa86-bbd3d1005b70', '{"action":"login","actor_id":"ca95ecfa-129b-48fc-8f85-492d7c8229b9","actor_username":"abc@google.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-07-04 15:36:59.558037+00', ''),
	('00000000-0000-0000-0000-000000000000', '362575f4-192e-49c7-80d4-876bd17697eb', '{"action":"user_recovery_requested","actor_id":"ca95ecfa-129b-48fc-8f85-492d7c8229b9","actor_username":"abc@google.com","actor_via_sso":false,"log_type":"user"}', '2025-07-04 15:37:01.023697+00', ''),
	('00000000-0000-0000-0000-000000000000', '21c4507f-35c9-43a0-9008-d079da0303b5', '{"action":"login","actor_id":"ca95ecfa-129b-48fc-8f85-492d7c8229b9","actor_username":"abc@google.com","actor_via_sso":false,"log_type":"account"}', '2025-07-04 15:37:11.606627+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a6c255c4-5641-4b66-8f02-ac35bdd0b376', '{"action":"token_refreshed","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 15:53:43.912612+00', ''),
	('00000000-0000-0000-0000-000000000000', '41cdda2b-3ca2-4c15-aee1-659889a0a308', '{"action":"token_revoked","actor_id":"e0d15d4a-b6ca-4d27-a809-6d84adca4abe","actor_username":"member@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 15:53:43.933003+00', ''),
	('00000000-0000-0000-0000-000000000000', 'fba16fa1-92f5-482e-bd9f-46e2c10a25fa', '{"action":"token_refreshed","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 16:26:19.367548+00', ''),
	('00000000-0000-0000-0000-000000000000', '1e21c6ed-486b-4298-b1a6-bd8c0be66dbd', '{"action":"token_revoked","actor_id":"ad4034c8-cf49-48af-b825-fd513c368132","actor_username":"admin@example.com","actor_via_sso":false,"log_type":"token"}', '2025-07-04 16:26:19.380845+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at") VALUES
	('e49b0444-1c8e-4b0d-af61-2b71cc24e83e', 'ad4034c8-cf49-48af-b825-fd513c368132', 'fe09f531-b873-43d4-aeac-09fc79a35cb9', 's256', 'PKlrR8plBtGrjDPnRo5i5KGC1Eoic2yPXce2Zre044M', 'magiclink', '', '', '2025-07-04 14:28:11.600817+00', '2025-07-04 14:28:11.600817+00', 'magiclink', NULL),
	('9824fffa-1d56-4129-887b-5640db37c2c4', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', '2611b08b-16c4-45d2-9c48-7d3160e8c2c4', 's256', 'hlSbXOHcNxppNW0AdiSVxau6uHv3kXVCOAPAvFH37to', 'magiclink', '', '', '2025-07-04 14:54:06.108693+00', '2025-07-04 14:54:06.108693+00', 'magiclink', NULL),
	('b55e5191-1446-4537-9bbf-255e072f65ac', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', 'e38eef0f-00dd-4d85-891d-622df8d6810d', 's256', 'ERYdEbIKV1WRZv_87wpZUsLHLk9FQdSJDyw7NQYD-rg', 'magiclink', '', '', '2025-07-04 15:37:00.914324+00', '2025-07-04 15:37:00.914324+00', 'magiclink', NULL);


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', 'authenticated', 'authenticated', 'member@example.com', '$2a$10$j5zfQygkc9ctNJ/edmZcOua8uOHK9IX05EtP8CJqmpV/b1Rfjps5W', '2025-07-04 14:54:05.923477+00', NULL, '', NULL, '', '2025-07-04 14:54:06.170697+00', '', '', NULL, '2025-07-04 14:54:59.341696+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "e0d15d4a-b6ca-4d27-a809-6d84adca4abe", "email": "member@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-04 14:54:05.766848+00', '2025-07-04 15:53:43.959417+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ad4034c8-cf49-48af-b825-fd513c368132', 'authenticated', 'authenticated', 'admin@example.com', '$2a$10$wuJfGMJAjI9cWdMFmona2uyk.zXryF2s6pWQxwS.73EYpZWe6M6xG', '2025-07-04 14:28:11.282021+00', NULL, '', NULL, '', '2025-07-04 14:28:11.679914+00', '', '', NULL, '2025-07-04 14:28:26.041681+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ad4034c8-cf49-48af-b825-fd513c368132", "email": "admin@example.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-04 14:28:10.593761+00', '2025-07-04 16:26:19.403645+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', 'authenticated', 'authenticated', 'abc@google.com', '$2a$10$AA5pLBy9fSjdQDNeO8kxqepQUmwtYnkv7IuN6LnAOSYdYqQDWimTm', '2025-07-04 15:36:59.12504+00', NULL, '', NULL, '', '2025-07-04 15:37:01.110562+00', '', '', NULL, '2025-07-04 15:37:11.61219+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "ca95ecfa-129b-48fc-8f85-492d7c8229b9", "email": "abc@google.com", "email_verified": true, "phone_verified": false}', NULL, '2025-07-04 15:36:58.465965+00', '2025-07-04 15:37:11.635437+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('ad4034c8-cf49-48af-b825-fd513c368132', 'ad4034c8-cf49-48af-b825-fd513c368132', '{"sub": "ad4034c8-cf49-48af-b825-fd513c368132", "email": "admin@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-04 14:28:11.259362+00', '2025-07-04 14:28:11.259468+00', '2025-07-04 14:28:11.259468+00', '9418d244-b686-4c5e-97ab-b64424850a8a'),
	('e0d15d4a-b6ca-4d27-a809-6d84adca4abe', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', '{"sub": "e0d15d4a-b6ca-4d27-a809-6d84adca4abe", "email": "member@example.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-04 14:54:05.899481+00', '2025-07-04 14:54:05.899556+00', '2025-07-04 14:54:05.899556+00', '8b6291b8-cdfa-4c10-87b9-2dd698b22571'),
	('ca95ecfa-129b-48fc-8f85-492d7c8229b9', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', '{"sub": "ca95ecfa-129b-48fc-8f85-492d7c8229b9", "email": "abc@google.com", "email_verified": false, "phone_verified": false}', 'email', '2025-07-04 15:36:58.795853+00', '2025-07-04 15:36:58.795934+00', '2025-07-04 15:36:58.795934+00', '1e2d0b58-a71f-4c00-8bef-ccff089b2d40');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('1ab44206-cee8-4b21-9fd2-7ad53a107ad5', 'ad4034c8-cf49-48af-b825-fd513c368132', '2025-07-04 14:28:11.319373+00', '2025-07-04 14:28:11.319373+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '172.18.0.1', NULL),
	('474827a7-43ef-47d7-9f29-2df364a78328', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', '2025-07-04 14:54:06.042569+00', '2025-07-04 14:54:06.042569+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36 Edg/138.0.0.0', '172.18.0.1', NULL),
	('4a8d88d4-9058-4e1a-b826-ef11b2d1bdbe', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', '2025-07-04 15:36:59.587246+00', '2025-07-04 15:36:59.587246+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '172.18.0.1', NULL),
	('9967e34c-c723-4f8d-882e-c756f0ea5e7c', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', '2025-07-04 15:37:11.612277+00', '2025-07-04 15:37:11.612277+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0', '172.18.0.1', NULL),
	('894fc181-0eb8-4750-87d0-e8d642acbec1', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', '2025-07-04 14:54:59.341916+00', '2025-07-04 15:53:43.976362+00', NULL, 'aal1', NULL, '2025-07-04 15:53:43.976217', 'Next.js Middleware', '172.18.0.1', NULL),
	('9533d7d0-0085-4f31-b6f5-dee206a9857a', 'ad4034c8-cf49-48af-b825-fd513c368132', '2025-07-04 14:28:26.0418+00', '2025-07-04 16:26:19.414732+00', NULL, 'aal1', NULL, '2025-07-04 16:26:19.414649', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36', '172.18.0.1', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('1ab44206-cee8-4b21-9fd2-7ad53a107ad5', '2025-07-04 14:28:11.399014+00', '2025-07-04 14:28:11.399014+00', 'password', '3e6fe691-cf23-4343-8887-6b2942e5bc91'),
	('9533d7d0-0085-4f31-b6f5-dee206a9857a', '2025-07-04 14:28:26.04855+00', '2025-07-04 14:28:26.04855+00', 'otp', 'e7b67974-daf6-4a90-bff1-029a34bedb51'),
	('474827a7-43ef-47d7-9f29-2df364a78328', '2025-07-04 14:54:06.07761+00', '2025-07-04 14:54:06.07761+00', 'password', '62c2e34e-3995-476f-bfc5-1bcaa6d1a5c5'),
	('894fc181-0eb8-4750-87d0-e8d642acbec1', '2025-07-04 14:54:59.369092+00', '2025-07-04 14:54:59.369092+00', 'otp', '5762dceb-183b-4a51-a37d-a1c6861837e7'),
	('4a8d88d4-9058-4e1a-b826-ef11b2d1bdbe', '2025-07-04 15:36:59.883604+00', '2025-07-04 15:36:59.883604+00', 'password', '7ba8d296-4224-4a2d-876a-e140ea59e67e'),
	('9967e34c-c723-4f8d-882e-c756f0ea5e7c', '2025-07-04 15:37:11.636706+00', '2025-07-04 15:37:11.636706+00', 'otp', '4e076a7d-7617-4d27-8273-31dd0e6846e5');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 1, '77xzjxdxvj5k', 'ad4034c8-cf49-48af-b825-fd513c368132', false, '2025-07-04 14:28:11.350664+00', '2025-07-04 14:28:11.350664+00', NULL, '1ab44206-cee8-4b21-9fd2-7ad53a107ad5'),
	('00000000-0000-0000-0000-000000000000', 3, 'ythmidtbovc4', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', false, '2025-07-04 14:54:06.062554+00', '2025-07-04 14:54:06.062554+00', NULL, '474827a7-43ef-47d7-9f29-2df364a78328'),
	('00000000-0000-0000-0000-000000000000', 2, 'eoji4fprz64e', 'ad4034c8-cf49-48af-b825-fd513c368132', true, '2025-07-04 14:28:26.044259+00', '2025-07-04 15:27:46.280898+00', NULL, '9533d7d0-0085-4f31-b6f5-dee206a9857a'),
	('00000000-0000-0000-0000-000000000000', 6, 'njz2vixiiaq7', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', false, '2025-07-04 15:36:59.77528+00', '2025-07-04 15:36:59.77528+00', NULL, '4a8d88d4-9058-4e1a-b826-ef11b2d1bdbe'),
	('00000000-0000-0000-0000-000000000000', 7, '5hn4hngyju42', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', false, '2025-07-04 15:37:11.630692+00', '2025-07-04 15:37:11.630692+00', NULL, '9967e34c-c723-4f8d-882e-c756f0ea5e7c'),
	('00000000-0000-0000-0000-000000000000', 4, 'exjvxsleijfj', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', true, '2025-07-04 14:54:59.363914+00', '2025-07-04 15:53:43.934453+00', NULL, '894fc181-0eb8-4750-87d0-e8d642acbec1'),
	('00000000-0000-0000-0000-000000000000', 8, 'sja2yrrtmdza', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', false, '2025-07-04 15:53:43.949913+00', '2025-07-04 15:53:43.949913+00', 'exjvxsleijfj', '894fc181-0eb8-4750-87d0-e8d642acbec1'),
	('00000000-0000-0000-0000-000000000000', 5, 'u6htkku7crft', 'ad4034c8-cf49-48af-b825-fd513c368132', true, '2025-07-04 15:27:46.302475+00', '2025-07-04 16:26:19.382096+00', 'eoji4fprz64e', '9533d7d0-0085-4f31-b6f5-dee206a9857a'),
	('00000000-0000-0000-0000-000000000000', 9, 'o544fxhkidl5', 'ad4034c8-cf49-48af-b825-fd513c368132', false, '2025-07-04 16:26:19.39375+00', '2025-07-04 16:26:19.39375+00', 'u6htkku7crft', '9533d7d0-0085-4f31-b6f5-dee206a9857a');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: organizations; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organizations" ("id", "owner_user_id", "name", "team_size", "website", "industry", "department", "position", "invite_token", "invite_token_generated_at", "restrict_clothing_options", "restrict_background_options", "created_at", "updated_at") VALUES
	('c549a467-b5ba-435c-8da1-6d089d49077e', 'ad4034c8-cf49-48af-b825-fd513c368132', 'Prime AI Company', 5, 'http://www.proshoot.co', NULL, NULL, NULL, 'ff5d7c9e-314d-4962-b5e6-91dcd3ef1a06', '2025-07-04 14:53:07.645357+00', false, false, '2025-07-04 14:40:42.827752+00', '2025-07-04 14:40:42.827752+00');


--
-- Data for Name: credits; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."credits" ("id", "user_id", "organization_id", "balance", "starter", "professional", "studio", "team", "updated_at") VALUES
	('8d0204c2-29c7-4575-ab09-6c9926d9a278', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', NULL, 0, 0, 0, 0, 2, '2025-07-04 15:02:54.872311+00'),
	('d77b78fb-0feb-4d42-a148-281f09c81ef0', 'ad4034c8-cf49-48af-b825-fd513c368132', 'c549a467-b5ba-435c-8da1-6d089d49077e', 0, 0, 0, 1, 0, '2025-07-04 15:37:22.116878+00'),
	('0e7ef410-a26a-4b2e-ad76-b00acc7e65aa', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', NULL, 0, 0, 0, 0, 1, '2025-07-04 15:37:22.116878+00');


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "user_id", "full_name", "avatar_url", "email", "referred_by", "created_at", "updated_at") VALUES
	('babd0414-cb26-4a45-86a0-ad9a4735b535', 'ad4034c8-cf49-48af-b825-fd513c368132', NULL, NULL, 'admin@example.com', NULL, '2025-07-04 14:28:10.587385+00', '2025-07-04 14:28:10.587385+00'),
	('9252c760-643b-47ba-9939-8d6287fc7bb8', 'e0d15d4a-b6ca-4d27-a809-6d84adca4abe', NULL, NULL, 'member@example.com', NULL, '2025-07-04 14:54:05.755693+00', '2025-07-04 14:54:05.755693+00'),
	('50188e2e-80a4-4c77-8e4d-8008f376e3ba', 'ca95ecfa-129b-48fc-8f85-492d7c8229b9', NULL, NULL, 'abc@google.com', NULL, '2025-07-04 15:36:58.398255+00', '2025-07-04 15:36:58.398255+00');


--
-- Data for Name: studios; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: result_headshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: invitations; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organization_approved_backgrounds; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organization_approved_clothing; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: organization_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."organization_members" ("id", "organization_id", "user_id", "role", "joined_at") VALUES
	('743e64aa-2890-459f-924d-ffd8ea0cffac', 'c549a467-b5ba-435c-8da1-6d089d49077e', 'ad4034c8-cf49-48af-b825-fd513c368132', 'admin', '2025-07-04 14:40:42.827752+00');


--
-- Data for Name: preview_headshots; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 9, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
