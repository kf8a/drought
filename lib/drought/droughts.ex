defmodule Drought.Droughts do

  import Ecto.Query, only: [from: 2]

  alias Drought.Repo
  alias Drought.Droughts.Drought

  def get_year_data(year) do
    query = from u in Drought,
      where: u.year == ^year

    Repo.all(query)
  end
end
