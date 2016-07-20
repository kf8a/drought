defmodule Drought.Drought do
  use Drought.Web, :model

  @schema_prefix 'weather'

  schema "drought_index" do
    field :date, Ecto.Date
    field :cumulative_precip_in, :float
    field :normal_cumulative_precip_in, :float
    field :growing_cumulative_precip_in, :float
    field :growing_normal_cumulative_precip_in, :float
  end
end
