dev:
	docker compose up --build
ssh:
	docker compose exec -u node app sh
