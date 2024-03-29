defmodule Drought.Droughts.Drought do
  use Ecto.Schema

  @schema_prefix "weather"
  @primary_key :false

  schema "drought_index_test" do
    field :date, :date
    field :cumulative_precip_in, :float
    field :normal_cumulative_precip_in, :float
    field :growing_cumulative_precip_in, :float
    field :growing_normal_cumulative_precip_in, :float
    field :year, :float
  end
end
