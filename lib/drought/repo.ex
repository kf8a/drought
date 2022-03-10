defmodule Drought.Repo do
  use Ecto.Repo,
    otp_app: :drought,
    adapter: Ecto.Adapters.Postgres
end
