defmodule Drought.DroughtView do
  use Drought.Web, :view

  def render("index.json", %{drought: drought}) do
    render_many(drought, Drought.DroughtView, "drought.json")
  end

  def render("drought.json", %{drought: drought}) do
    %{annual: %{date: drought.date,
     precip: drought.cumulative_precip_in,
     ytd: drought.normal_cumulative_precip_in},
     growing: %{date: growing_date(drought),
     precip: drought.growing_cumulative_precip_in,
     ytd: drought.growing_normal_cumulative_precip_in}
   }
  end

  defp growing_date(drought) do
    if (drought.growing_cumulative_precip_in != nil )  do
      drought.date
    end
  end
end
