defmodule Drought.PageController do
  use Drought.Web, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
