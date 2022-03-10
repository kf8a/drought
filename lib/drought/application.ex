defmodule Drought.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Ecto repository
      Drought.Repo,
      # Start the Telemetry supervisor
      DroughtWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: Drought.PubSub},
      # Start the Endpoint (http/https)
      DroughtWeb.Endpoint
      # Start a worker by calling: Drought.Worker.start_link(arg)
      # {Drought.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Drought.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    DroughtWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
