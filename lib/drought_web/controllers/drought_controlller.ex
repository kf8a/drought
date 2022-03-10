defmodule DroughtWeb.DroughtController do
  use DroughtWeb, :controller

  alias Drought.Droughts

  def index(conn, %{"year" => year}) do
    drought = Droughts.get_year_data(year)
    render(conn, "index.json", drought: drought)
  end

  def index(conn, _params) do
    current_year = DateTime.utc_now().year()

    drought = Droughts.get_year_data(current_year)
    render(conn, "index.json", drought: drought)
  end
end
