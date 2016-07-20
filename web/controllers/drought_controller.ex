defmodule Drought.DroughtController do
  use Drought.Web, :controller

  alias Drought.Drought

  def index(conn, _params) do
    drought = Repo.all(Drought)
    render(conn, "index.json", drought: drought)
  end
end
